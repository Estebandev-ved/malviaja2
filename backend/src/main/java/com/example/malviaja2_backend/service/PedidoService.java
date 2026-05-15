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

        // 2. Calcular total en el servidor de forma segura (ignora el total enviado por el cliente)
        ResultadoTotal res = calcularTotalSeguro(request.getCarrito(), usuario, request.getCostoEnvio());

        usuario.setDireccionPorDefecto(HtmlUtils.htmlEscape(request.getDireccion()));
        usuario.setTelefonoPorDefecto(HtmlUtils.htmlEscape(request.getTelefono()));
        
        // Actualizar datos de exclusividad
        usuario.setPrimerCompraRealizada(true);
        usuario.setUltimaCompra(java.time.LocalDateTime.now());
        usuario.setActivo(true); // Reactivar si estaba inactivo
        
        usuarioRepository.save(usuario);

        // 3. Validar y decrementar stock (lanza excepción si no hay stock suficiente)
        decrementarStock(request.getCarrito());

        // 4. Guardar el pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setNombreReceptor(HtmlUtils.htmlEscape(request.getNombre()));
        pedido.setTelefono(HtmlUtils.htmlEscape(request.getTelefono()));
        pedido.setDireccionEnvio(HtmlUtils.htmlEscape(request.getDireccion()));
        pedido.setTotal(res.total);
        pedido.setSubtotal(res.subtotal);
        pedido.setCostoEnvio(res.envio);
        pedido.setDescuento(res.descuento);
        pedido.setCarritoJson(request.getCarrito());
        pedido.setEstado("PENDIENTE");

        // Generar referencia única MV-YYYY-XXXX
        String ref = request.getReferencia();
        if (ref == null || ref.isBlank()) {
            ref = "MV-" + Year.now() + "-" + String.format("%04d", new Random().nextInt(10000));
        }
        pedido.setReferencia(ref);

        // 4.1 Analizar comprobante con IA para validar pago
        OcrExtractionResult extraction = geminiOcrService.extraerComprobante(comprobante);
        aplicarResultadoOcr(pedido, extraction, res.total);
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
                && Math.round(totalPedido) == extraction.getMonto().longValue();

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
                    pedido.getId(), extraction.getMonto(), totalPedido != null ? Math.round(totalPedido) : "null");
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
                String error = String.format("Cantidad inválida detectada para producto '%s': %d. Posible fraude.", item.get("nombre"), cantidadSolicitada);
                log.error("❌ {}", error);
                throw new IllegalStateException(error);
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

    /**
     * Calcula el precio total del carrito directamente desde la Base de Datos para evitar manipulación.
     * Aplica la promoción 2x1 si corresponde y el usuario es elegible.
     */
    @SuppressWarnings("unchecked")
    private static class ResultadoTotal {
        double total, subtotal, envio, descuento;
        ResultadoTotal(double total, double subtotal, double envio, double descuento) {
            this.total = total; this.subtotal = subtotal; this.envio = envio; this.descuento = descuento;
        }
    }

    private ResultadoTotal calcularTotalSeguro(String carritoJson, Usuario usuario, Double costoEnvioFront) throws Exception {
        com.example.malviaja2_backend.model.ConfiguracionGlobal config = configuracionService.obtenerConfiguracion();
        double subtotal = 0.0;
        int cantidadBrowniesFuerte = 0;
        double precioBrownieFuerte = 15000.0; // Precio base asumido para la promo
        
        List<Map<String, Object>> items = objectMapper.readValue(carritoJson, List.class);
        
        for (Map<String, Object> item : items) {
            Object rawId = item.get("id");
            if (rawId == null) continue;

            Long productoId = parseProductoId(rawId);
            if (productoId == null) continue;

            int cantidadSolicitada = parseCantidad(item.get("cantidad"));
            if (cantidadSolicitada <= 0) {
                throw new IllegalStateException("Cantidad inválida detectada. Posible fraude.");
            }

            Producto producto = productoRepository.findById(productoId)
                    .orElseThrow(() -> new IllegalStateException("Producto no encontrado en la base de datos: " + productoId));

            double precioTotalProducto = producto.getPrecio() * cantidadSolicitada;
            subtotal += precioTotalProducto;

            // Identificar si es el producto de la promo
            String nombreLimpio = producto.getNombre().toLowerCase().trim();
            String promoProdsRaw = config.getPromoProducts() != null ? config.getPromoProducts() : "Brownie Fuerte";
            String[] promoKeywords = promoProdsRaw.toLowerCase().split(",");

            boolean isPromoProduct = false;
            for (String keyword : promoKeywords) {
                String kw = keyword.trim();
                if ("all".equals(kw)) {
                    isPromoProduct = true;
                    break;
                }
                if (nombreLimpio.contains(kw)) {
                    isPromoProduct = true;
                    break;
                }
            }

            if (isPromoProduct) {
                cantidadBrowniesFuerte += cantidadSolicitada;
                precioBrownieFuerte = producto.getPrecio();
            }
        }

        double subtotalPrePromo = subtotal;

        if (subtotalPrePromo < config.getCompraMinima()) {
            throw new IllegalStateException("El subtotal del pedido ($" + subtotalPrePromo + ") no alcanza el mínimo requerido: $" + config.getCompraMinima());
        }

        boolean isPromoActive = config.getPromo2x1Enabled() != null && config.getPromo2x1Enabled();

        if (isPromoActive && "PROGRAMADA".equalsIgnoreCase(config.getPromoMode())) {
            try {
                String startStr = config.getPromoStartTime() != null ? config.getPromoStartTime() : "22:00";
                int duration = config.getPromoDuration() != null ? config.getPromoDuration() : 4;
                java.time.LocalTime now = java.time.LocalTime.now();
                java.time.LocalTime start = java.time.LocalTime.parse(startStr);
                java.time.LocalTime end = start.plusHours(duration);

                if (start.isBefore(end)) {
                    isPromoActive = !now.isBefore(start) && !now.isAfter(end);
                } else {
                    isPromoActive = !now.isBefore(start) || !now.isAfter(end);
                }
            } catch (Exception e) {
                log.error("Error al validar horario de promo: {}", e.getMessage());
                isPromoActive = false;
            }
        }

        // --- VALIDACIONES ANTIABUSO ---
        // 1. Verificar límite global de la promo
        if (isPromoActive) {
            int maxUsuarios = config.getPromo2x1MaxUsuarios() != null ? config.getPromo2x1MaxUsuarios() : 20;
            long usuariosConPromo = pedidoRepository.countUsuariosConPromo2x1Aplicada();
            if (usuariosConPromo >= maxUsuarios) {
                log.warn("Promo 2x1 BLOQUEADA: se alcanzó el límite de {} usuarios únicos.", maxUsuarios);
                isPromoActive = false;
            }
        }

        // 2. Verificar si este usuario ya usó la promo (1 solo beneficio por cuenta)
        if (isPromoActive && usuario.getId() != null) {
            long yaUsoPromo = pedidoRepository.countPromo2x1UsadaPorUsuario(usuario.getId());
            if (yaUsoPromo > 0) {
                log.warn("Usuario {} ya usó la promo 2x1 anteriormente. No se aplica nuevamente.", usuario.getEmail());
                isPromoActive = false;
            }
        }

        boolean targetMatches = true;
        if ("NUEVOS".equalsIgnoreCase(config.getPromoTarget())) {
            targetMatches = usuario.getPrimerCompraRealizada() == null || !usuario.getPrimerCompraRealizada();
        }

        if (isPromoActive && targetMatches) {
            String tipo = config.getPromoTipo() != null ? config.getPromoTipo() : "2X1";

            if ("2X1".equalsIgnoreCase(tipo) && cantidadBrowniesFuerte >= 2) {
                double precio2Unidades = (config.getPromoValue() != null && config.getPromoValue() > 0)
                    ? config.getPromoValue()
                    : precioBrownieFuerte;
                double descuento = Math.max(0, (precioBrownieFuerte * 2) - precio2Unidades);
                subtotal -= descuento;
                log.info("Promo 2x1 aplicada: 2 unid. por ${} (ahorro ${})", precio2Unidades, descuento);
            } else if ("PERCENT".equalsIgnoreCase(tipo) && config.getPromoValue() != null && config.getPromoValue() > 0) {
                double discount = subtotal * (config.getPromoValue() / 100.0);
                subtotal -= discount;
                log.info("Promo Descuento {}% aplicada: -{}", config.getPromoValue(), discount);
            } else if ("FIXED".equalsIgnoreCase(tipo) && config.getPromoValue() != null && config.getPromoValue() > 0) {
                subtotal -= config.getPromoValue();
                log.info("Promo Descuento Fijo ${} aplicada", config.getPromoValue());
            }
        } else if (isPromoActive && !targetMatches && cantidadBrowniesFuerte >= 2) {
            log.warn("Usuario {} no elegible para promo (Target: {}).", usuario.getEmail(), config.getPromoTarget());
        }

        double envio = 0.0;
        // deliveryMinFree: umbral para envío gratis. Si no está configurado, usar 150000 por defecto.
        double minFree = config.getDeliveryMinFree() != null ? config.getDeliveryMinFree() : 150000.0;
        log.info("Subtotal pre-promo: {}, Umbral envío gratis: {}", subtotalPrePromo, minFree);
        if (subtotalPrePromo < minFree) {
            // Si el frontend envió un costo de envío válido (>0), usarlo. Si no, cobrar $10,000 fijo.
            if (costoEnvioFront != null && costoEnvioFront > 0) {
                envio = costoEnvioFront;
            } else {
                envio = 10000.0;
            }
            log.info("Envío aplicado: {} (frontend envió: {})", envio, costoEnvioFront);
        } else {
            log.info("Envío gratis (subtotal {} >= umbral {})", subtotalPrePromo, minFree);
        }

        double descuentoTotal = Math.max(0, subtotalPrePromo - subtotal);
        log.info("TOTAL FINAL -> subtotal={}, envio={}, descuento={}, TOTAL={}", subtotal, envio, descuentoTotal, subtotal + envio);
        return new ResultadoTotal(subtotal + envio, subtotalPrePromo, envio, descuentoTotal);
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
                && Math.round(total) == extraction.getMonto().longValue();
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

    @SuppressWarnings("unchecked")
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
