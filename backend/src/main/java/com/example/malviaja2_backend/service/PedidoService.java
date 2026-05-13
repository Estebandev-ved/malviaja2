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

import java.time.Year;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;

@Service
public class PedidoService {

    private static final Logger log = LoggerFactory.getLogger(PedidoService.class);

    private static final Set<String> ESTADOS_VALIDOS = Set.of(
            "PENDIENTE",
            "PAGADO",
            "REVISION_MANUAL",
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
    private final GeminiOcrService geminiOcrService;

    public PedidoService(
            PedidoRepository pedidoRepository,
            UsuarioRepository usuarioRepository,
            ProductoRepository productoRepository,
            TelegramBotService telegramBotService,
            ObjectMapper objectMapper,
            ConfiguracionService configuracionService,
            EmailNotificationService emailNotificationService,
            GeminiOcrService geminiOcrService) {
        this.pedidoRepository = pedidoRepository;
        this.usuarioRepository = usuarioRepository;
        this.productoRepository = productoRepository;
        this.telegramBotService = telegramBotService;
        this.objectMapper = objectMapper;
        this.configuracionService = configuracionService;
        this.emailNotificationService = emailNotificationService;
        this.geminiOcrService = geminiOcrService;
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

        // Generar referencia única MV-YYYY-XXXX
        String ref = request.getReferencia();
        if (ref == null || ref.isBlank()) {
            ref = "MV-" + Year.now() + "-" + String.format("%04d", new Random().nextInt(10000));
        }
        pedido.setReferencia(ref);

        // 3.1 Analizar comprobante con IA para validar pago
        OcrExtractionResult extraction = geminiOcrService.extraerComprobante(comprobante);
        aplicarResultadoOcr(pedido, extraction, request.getTotal());
        pedido = pedidoRepository.save(pedido);
        log.info("✅ Pedido #{} guardado en BD. Cliente: {}", pedido.getId(), usuario.getEmail());

        // 4. Notificar por Telegram (no bloquea aunque falle)
        notificarTelegram(pedido, request, comprobante, extraction);
        return pedido;
    }

    private void aplicarResultadoOcr(Pedido pedido, OcrExtractionResult extraction, Double totalPedido) {
        if (extraction == null) {
            pedido.setEstado("PENDIENTE");
            return;
        }

        if (extraction.getError() != null) {
            pedido.setEstado("PENDIENTE");
            String reason = "OCR_ERROR:" + extraction.getError();
            pedido.setOcrJson(reason);
            log.info("Pedido #{} → estado PENDIENTE por error OCR: {}", pedido.getId(), extraction.getError());
            return;
        }

        if (extraction.getReferencia() != null) {
            pedido.setReferenciaPago(extraction.getReferencia());
        }
        if (extraction.getEntidad() != null) {
            pedido.setEntidadPago(extraction.getEntidad());
        }
        if (extraction.getFecha() != null) {
            pedido.setFechaPago(extraction.getFecha());
        }
        if (extraction.getConfianzaExtraccion() != null) {
            pedido.setConfianzaExtraccion(extraction.getConfianzaExtraccion());
        }
        if (extraction.getRawJson() != null) {
            pedido.setOcrJson(extraction.getRawJson());
        } else if (extraction.getRawText() != null) {
            pedido.setOcrJson(extraction.getRawText());
        }

        boolean montoCoincide = extraction.getMonto() != null && totalPedido != null
                && Math.round(totalPedido) == extraction.getMonto();

        boolean referenciaUnica = extraction.getReferencia() != null
                && pedidoRepository.findByReferenciaPago(extraction.getReferencia()).isEmpty();

        boolean altaConfianza = extraction.getConfianzaExtraccion() != null
                && extraction.getConfianzaExtraccion() >= 0.8;

        if (montoCoincide && referenciaUnica && altaConfianza) {
            pedido.setEstado("PAGADO");
            log.info("Pedido #{} → PAGADO: monto={}, ref={}, confianza={}", pedido.getId(),
                    extraction.getMonto(), extraction.getReferencia(), extraction.getConfianzaExtraccion());
            return;
        }

        if (montoCoincide && referenciaUnica) {
            pedido.setEstado("REVISION_MANUAL");
            log.info("Pedido #{} → REVISION_MANUAL: monto coincide pero confianza baja ({})",
                    pedido.getId(), extraction.getConfianzaExtraccion());
            return;
        }

        if (!montoCoincide) {
            pedido.setEstado("REVISION_MANUAL");
            log.info("Pedido #{} → REVISION_MANUAL: monto OCR ({}) no coincide con total del pedido ({})",
                    pedido.getId(), extraction.getMonto(), Math.round(totalPedido));
            return;
        }

        if (!referenciaUnica) {
            pedido.setEstado("REVISION_MANUAL");
            log.info("Pedido #{} → REVISION_MANUAL: referencia '{}' ya existe en otro pedido",
                    pedido.getId(), extraction.getReferencia());
        }
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

            Long productoId = parseProductoId(rawId);
            if (productoId == null) {
                log.info("Producto personalizado (sin stock en BD): id={}, nombre={}. Saltando decremento de stock.", rawId, item.get("nombre"));
                continue;
            }
            int cantidadSolicitada = parseCantidad(item.get("cantidad"));
            if (cantidadSolicitada <= 0) {
                log.warn("Cantidad inválida para producto {}: {}. Saltando.", productoId, item.get("cantidad"));
                continue;
            }

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

    private Long parseProductoId(Object rawId) {
        if (rawId == null) return null;
        String value = rawId.toString();
        if (value.isBlank()) return null;
        for (int i = 0; i < value.length(); i++) {
            if (!Character.isDigit(value.charAt(i))) {
                return null;
            }
        }
        return Long.valueOf(value);
    }

    private int parseCantidad(Object rawCantidad) {
        if (rawCantidad == null) return 0;
        String value = rawCantidad.toString();
        if (value.isBlank()) return 0;
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            return 0;
        }
    }


    public List<Pedido> obtenerHistorial(String firebaseUid) {
        return usuarioRepository.findByFirebaseUid(firebaseUid)
                .map(pedidoRepository::findByUsuarioOrderByFechaPedidoDesc)
                .orElse(List.of());
    }

    public Optional<Pedido> obtenerPorReferencia(String referencia) {
        return pedidoRepository.findByReferencia(referencia);
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

            if ("PAGADO".equals(nuevoEstado)) {
                // Acreditar puntos de fidelidad automáticamente
                Usuario usuario = pedido.getUsuario();
                if (usuario != null) {
                    int puntos = (int) Math.round(pedido.getTotal() / 100);
                    usuario.setPuntos(usuario.getPuntos() + puntos);
                    usuarioRepository.save(usuario);
                    log.info("🏆 {} puntos acreditados al usuario {} por pedido #{}", puntos, usuario.getId(), pedido.getId());
                }
            }

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
    private void notificarTelegram(Pedido pedido, PedidoRequest request, MultipartFile comprobante, OcrExtractionResult extraction) {
        String chatId = telegramBotService.getAdminChatId();
        if (chatId == null || chatId.isBlank() || "000000".equals(chatId)) {
            log.info("Notificación Telegram omitida para pedido #{}: adminChatId no configurado.", pedido.getId());
            return;
        }
        try {
            String resumenOcr = buildOcrSummary(extraction, request.getTotal());
            String ocrReason = buildOcrReason(extraction, request.getTotal());
            String caption = "🚨 *¡NUEVO PEDIDO!* 🚨\n\n" +
                    "🆔 *Orden:* #" + pedido.getId() + "\n" +
                    "👤 *Cliente:* " + request.getNombre() + "\n" +
                    "📱 *Teléfono:* " + request.getTelefono() + "\n" +
                    "📍 *Dirección:* " + request.getDireccion() + "\n" +
                    "💰 *Total:* $" + String.format("%.0f", request.getTotal()) + "\n\n" +
                    "🧾 *OCR:* " + resumenOcr + "\n" +
                    "📋 *Decisión:* " + ocrReason + "\n\n" +
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
            sendPhoto.setChatId(chatId);
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

    private String buildOcrReason(OcrExtractionResult extraction, Double total) {
        if (extraction == null) return "Sin análisis";
        if (extraction.getError() != null) return "Error OCR: " + extraction.getError();

        boolean montoCoincide = extraction.getMonto() != null && total != null
                && Math.round(total) == extraction.getMonto();
        boolean altaConfianza = extraction.getConfianzaExtraccion() != null
                && extraction.getConfianzaExtraccion() >= 0.8;

        if (montoCoincide && altaConfianza) return "✅ Pago verificado (confianza alta)";
        if (montoCoincide) return "⚠️ Monto coincide, confianza baja (" + String.format("%.0f", extraction.getConfianzaExtraccion() * 100) + "%) → Revisión manual";
        if (!montoCoincide && extraction.getMonto() != null)
            return "⚠️ Monto no coincide: OCR=$" + extraction.getMonto() + " vs Total=$" + String.format("%.0f", total) + " → Revisión manual";
        return "⚠️ Revisión manual";
    }

    private String buildOcrSummary(OcrExtractionResult extraction, Double total) {
        if (extraction == null) {
            return "Sin análisis";
        }
        String monto = extraction.getMonto() != null ? extraction.getMonto().toString() : "-";
        String ref = extraction.getReferencia() != null ? extraction.getReferencia() : "-";
        String fecha = extraction.getFecha() != null ? extraction.getFecha().toString() : "-";
        String entidad = extraction.getEntidad() != null ? extraction.getEntidad() : "-";
        String conf = extraction.getConfianzaExtraccion() != null ? String.format("%.2f", extraction.getConfianzaExtraccion()) : "-";
        String totalStr = total != null ? String.format("%.0f", total) : "-";
        return "monto=" + monto + ", total=" + totalStr + ", ref=" + ref + ", fecha=" + fecha + ", entidad=" + entidad + ", conf=" + conf;
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
