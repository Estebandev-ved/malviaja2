package com.example.malviaja2_backend.service;

import com.example.malviaja2_backend.model.Pedido;
import com.example.malviaja2_backend.model.PedidoRequest;
import com.example.malviaja2_backend.model.Producto;
import com.example.malviaja2_backend.model.Usuario;
import com.example.malviaja2_backend.repository.PedidoRepository;
import com.example.malviaja2_backend.repository.ProductoRepository;
import com.example.malviaja2_backend.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.HtmlUtils;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;
import org.telegram.telegrambots.meta.api.objects.InputFile;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class PedidoService {

    private static final Logger log = LoggerFactory.getLogger(PedidoService.class);

    private static final Set<String> ESTADOS_VALIDOS = Set.of(
            "PENDIENTE",
            "ACEPTADO",
            "PREPARANDO",
            "EN_CAMINO",
            "ENTREGADO",
            "CANCELADO"
    );

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;
    private final TelegramBotService telegramBotService;
    private final ObjectMapper objectMapper;
    private final ConfiguracionService configuracionService;
    private final EmailNotificationService emailNotificationService;

    public PedidoService(
            PedidoRepository pedidoRepository,
            UsuarioRepository usuarioRepository,
            ProductoRepository productoRepository,
            TelegramBotService telegramBotService,
            ObjectMapper objectMapper,
            ConfiguracionService configuracionService,
            EmailNotificationService emailNotificationService) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.telegramBotService = telegramBotService;
        this.objectMapper = objectMapper;
        this.configuracionService = configuracionService;
        this.emailNotificationService = emailNotificationService;
    }

    @Transactional
    public Pedido procesarCheckout(PedidoRequest request, MultipartFile comprobante) throws Exception {
        // 1. Sincronizar usuario con la BD local
        Usuario usuario = usuarioRepository.findByFirebaseUid(request.getUserId())
                .orElseGet(() -> {
                    Usuario nuevo = new Usuario();
                    nuevo.setFirebaseUid(request.getUserId());
                    nuevo.setEmail(request.getEmail() != null && !request.getEmail().isBlank()
                            ? request.getEmail()
                            : "usuario@malviaja2.com");
                    nuevo.setNombre(HtmlUtils.htmlEscape(request.getNombre()));
                    log.info("Nuevo usuario sincronizado desde checkout: {}", nuevo.getEmail());
                    return usuarioRepository.save(nuevo);
                });

        // Validar compra mínima desde la configuración global
        double compraMinima = configuracionService.obtenerConfiguracion().getCompraMinima();
        // Nota: asumiendo que request.getTotal() es el total del pedido con envíos. Lo ideal es validar el subtotal de los productos,
        // pero validaremos el total general si no hay un subtotal en el request.
        if (request.getTotal() < compraMinima) {
            throw new IllegalStateException("El total del pedido no alcanza el mínimo requerido para exclusividad: $" + compraMinima);
        }

        usuario.setDireccionPorDefecto(HtmlUtils.htmlEscape(request.getDireccion()));
        usuario.setTelefonoPorDefecto(HtmlUtils.htmlEscape(request.getTelefono()));
        
        // Actualizar datos de exclusividad
        usuario.setPrimerCompraRealizada(true);
        usuario.setUltimaCompra(java.time.LocalDateTime.now());
        usuario.setActivo(true); // Reactivar si estaba inactivo
        
        usuarioRepository.save(usuario);

        // 2. Validar y decrementar stock (lanza excepción si no hay stock suficiente)
        // La transacción garantiza que si algo falla, ningún stock se modifica.
        decrementarStock(request.getCarrito());

        // 3. Guardar el pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setNombreReceptor(HtmlUtils.htmlEscape(request.getNombre()));
        pedido.setTelefono(HtmlUtils.htmlEscape(request.getTelefono()));
        pedido.setDireccionEnvio(HtmlUtils.htmlEscape(request.getDireccion()));
        pedido.setTotal(request.getTotal());
        pedido.setCarritoJson(request.getCarrito());
        pedido.setEstado("PENDIENTE");
        pedido = pedidoRepository.save(pedido);
        log.info("✅ Pedido #{} guardado en BD. Cliente: {}", pedido.getId(), usuario.getEmail());

        // 4. Notificar por Telegram (no bloquea aunque falle)
        notificarTelegram(pedido, request, comprobante);
        return pedido;
    }

    /**
     * Valida que haya stock suficiente para cada ítem del carrito y lo decrementa.
     * Si algún producto no tiene stock, lanza IllegalStateException (transacción revierte).
     */
    @SuppressWarnings("unchecked")
    private void decrementarStock(String carritoJson) throws Exception {
        List<Map<String, Object>> items = objectMapper.readValue(carritoJson, List.class);
        for (Map<String, Object> item : items) {
            // El carrito puede tener 'id' como Integer o Long según la fuente
            Object rawId = item.get("id");
            if (rawId == null) continue; // Producto sin ID (datos de prueba), saltar

            Long productoId = Long.valueOf(rawId.toString());
            int cantidadSolicitada = item.get("cantidad") instanceof Integer
                    ? (Integer) item.get("cantidad")
                    : Integer.parseInt(item.get("cantidad").toString());

            Optional<Producto> productoOpt = productoRepository.findById(productoId);
            if (productoOpt.isEmpty()) {
                log.warn("Producto #{} no existe en BD, posiblemente dato de prueba. Saltando.", productoId);
                continue;
            }

            Producto producto = productoOpt.get();
            if (producto.getStock() < cantidadSolicitada) {
                String error = String.format(
                    "Stock insuficiente para '%s'. Disponible: %d, Solicitado: %d.",
                    producto.getNombre(), producto.getStock(), cantidadSolicitada
                );
                log.error("❌ {}", error);
                throw new IllegalStateException(error);
            }

            producto.setStock(producto.getStock() - cantidadSolicitada);
            productoRepository.save(producto);
            log.info("📦 Stock de '{}' actualizado: {} → {}", producto.getNombre(),
                    producto.getStock() + cantidadSolicitada, producto.getStock());
        }
    }


    public List<Pedido> obtenerHistorial(String firebaseUid) {
        return usuarioRepository.findByFirebaseUid(firebaseUid)
                .map(pedidoRepository::findByUsuarioOrderByFechaPedidoDesc)
                .orElse(List.of());
    }

    public Page<Pedido> obtenerTodos(Pageable pageable) {
        return pedidoRepository.findAll(pageable);
    }

    @Transactional
    public Optional<Pedido> actualizarEstado(Long pedidoId, String nuevoEstado, String motivo) {
        if (nuevoEstado == null || !ESTADOS_VALIDOS.contains(nuevoEstado)) {
            throw new IllegalArgumentException("Estado invalido. Estados permitidos: " + ESTADOS_VALIDOS);
        }

        return pedidoRepository.findById(pedidoId).map(pedido -> {
            pedido.setEstado(nuevoEstado);
            Pedido actualizado = pedidoRepository.save(pedido);

            if ("PREPARANDO".equals(nuevoEstado) || "CANCELADO".equals(nuevoEstado)) {
                String email = pedido.getUsuario() != null ? pedido.getUsuario().getEmail() : null;
                String nombre = pedido.getNombreReceptor() != null ? pedido.getNombreReceptor() : "Cliente";
                String comprobanteUrl = "https://via.placeholder.com/640x420?text=Comprobante+Rechazado";
                emailNotificationService.enviarEstadoPedido(email, nombre, pedido.getId(), nuevoEstado, motivo, comprobanteUrl);
            }

            return actualizado;
        });
    }

    // Notificación no bloqueante: si Telegram falla el pedido ya está guardado
    private void notificarTelegram(Pedido pedido, PedidoRequest request, MultipartFile comprobante) {
        try {
            String caption = "🚨 *¡NUEVO PEDIDO!* 🚨\n\n" +
                    "🆔 *Orden:* #" + pedido.getId() + "\n" +
                    "👤 *Cliente:* " + request.getNombre() + "\n" +
                    "📱 *Teléfono:* " + request.getTelefono() + "\n" +
                    "📍 *Dirección:* " + request.getDireccion() + "\n" +
                    "💰 *Total:* $" + String.format("%.0f", request.getTotal()) + "\n\n" +
                    "🛒 *Productos:*\n" + formatCarrito(request.getCarrito());

            InlineKeyboardButton btnAceptar = new InlineKeyboardButton();
            btnAceptar.setText("✅ Aceptar y Preparar");
            btnAceptar.setCallbackData("ACEPTAR_" + pedido.getId());

            InlineKeyboardButton btnCancelar = new InlineKeyboardButton();
            btnCancelar.setText("❌ Rechazar");
            btnCancelar.setCallbackData("RECHAZAR_" + pedido.getId());

            InlineKeyboardMarkup markup = new InlineKeyboardMarkup();
            markup.setKeyboard(List.of(List.of(btnAceptar, btnCancelar)));

            SendPhoto sendPhoto = new SendPhoto();
            sendPhoto.setChatId(telegramBotService.getAdminChatId());
            sendPhoto.setPhoto(new InputFile(comprobante.getInputStream(), comprobante.getOriginalFilename()));
            sendPhoto.setCaption(caption);
            sendPhoto.setParseMode("Markdown");
            sendPhoto.setReplyMarkup(markup);

            telegramBotService.execute(sendPhoto);
            log.info("Notificación Telegram enviada para pedido #{}.", pedido.getId());

        } catch (Exception e) {
            log.warn("Pedido #{} guardado, pero falló la notificación Telegram: {}", pedido.getId(), e.getMessage());
        }
    }

    private String formatCarrito(String carritoJson) {
        try {
            List<Map<String, Object>> items = objectMapper.readValue(carritoJson, List.class);
            StringBuilder sb = new StringBuilder();
            for (Map<String, Object> item : items) {
                sb.append("- ").append(item.get("cantidad")).append("x ").append(item.get("nombre"));
                if (item.containsKey("dosisMg") && item.get("dosisMg") != null) {
                    sb.append(" 🧬 (*").append(item.get("dosisMg")).append("mg THC*)");
                }
                sb.append("\n");
            }
            return sb.toString();
        } catch (Exception e) {
            return carritoJson;
        }
    }
}
