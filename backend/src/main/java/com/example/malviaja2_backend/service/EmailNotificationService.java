package com.example.malviaja2_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);
    private final RestTemplate restTemplate;

    @Value("${resend.api.key}")
    private String resendApiKey;

    @Value("${resend.from.email}")
    private String fromEmail;

    public EmailNotificationService() {
        this.restTemplate = new RestTemplate();
    }

    private void enviarViaResend(String to, String subject, String body) {
        if (resendApiKey == null || resendApiKey.isBlank() || resendApiKey.contains("PON_TU_API_KEY")) {
            log.warn("⚠️ Resend API Key no configurada. Simulando envío...");
            logSimulado(to, subject, body);
            return;
        }

        try {
            // Diagnóstico rápido de DNS
            try {
                java.net.InetAddress.getByName("api.resend.com");
            } catch (Exception e) {
                log.error("❌ Java no puede resolver 'api.resend.com'. Revisa tu conexión o DNS.");
                logSimulado(to, subject, body);
                return;
            }

            String url = "https://api.resend.com/emails";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            Map<String, Object> request = new HashMap<>();
            request.put("from", fromEmail);
            request.put("to", to);
            request.put("subject", subject);
            request.put("html", body.replace("\n", "<br>")); // Convertir saltos de línea a HTML

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode().is2xxSuccessful()) {
                log.info("✅ Email enviado vía Resend a: {}", to);
            } else {
                log.error("❌ Falló envío vía Resend: {}", response.getBody());
            }
        } catch (Exception e) {
            log.error("❌ Error conectando con Resend: {}", e.getMessage());
            logSimulado(to, subject, body);
        }
    }

    private void logSimulado(String to, String subject, String body) {
        log.info("📧 [SIMULADO] Para: {} | Asunto: {}", to, subject);
    }

    public void enviarNotificacionInactividad(String emailDestino, String nombreCliente) {
        String asunto = "⚠️ Tu cuenta de Malviaja2 está inactiva";
        String mensaje = "Hola " + nombreCliente + ",\n\n" +
                "Notamos que llevas más de 15 días sin hacer un pedido. " +
                "Como somos un club de acceso limitado, hemos puesto tu cuenta en modo inactivo.\n\n" +
                "Realiza un pedido hoy mismo para volver al club.\n\n" +
                "Atentamente,\nEl Equipo de Malviaja2";

        enviarViaResend(emailDestino, asunto, mensaje);
    }

    public void enviarPromocion(String emailDestino, String nombreCliente, String promo) {
        String asunto = "🎁 ¡Promoción Especial Malviaja2!";
        String mensaje = "Hola " + nombreCliente + ",\n\n" +
                "Tienes una sorpresa: " + promo + "\n\n" +
                "Atentamente,\nEl Equipo de Malviaja2";
        enviarViaResend(emailDestino, asunto, mensaje);
    }

    public void enviarEstadoPedido(String emailDestino, String nombreCliente, Long pedidoId, String estado, String motivo, String comprobanteUrl) {
        String asunto = "📦 Pedido #" + pedidoId + ": " + estado;
        
        String emoji = "ACEPTADO".equals(estado) ? "✅" : "CANCELADO".equals(estado) ? "❌" : "🚚";
        
        String mensaje = "<h2>¡Hola " + nombreCliente + "!</h2>" +
                "<p>Tu pedido <b>#" + pedidoId + "</b> ha cambiado su estado a: <b>" + emoji + " " + estado + "</b>.</p>" +
                (motivo != null && !motivo.isBlank() ? "<p><b>Motivo:</b> " + motivo + "</p>" : "") +
                "<p>Puedes ver los detalles entrando a tu cuenta en Malviaja2.</p>" +
                "<p>¡Gracias por elegirnos! 🚀</p>";

        enviarViaResend(emailDestino, asunto, mensaje);
    }

    public void enviarEmailRecuperacion(String emailDestino, String nombreCliente) {
        String asunto = "¿Te quedaste con el antojo? 🍫 (Regalo adentro)";
        String mensaje = "Hola " + nombreCliente + ",\n\n" +
                "Vimos que te uniste a la comunidad Malviaja2 pero aún no pruebas nuestros brownies.\n\n" +
                "Si pides tu Combo 2x1 hoy, te incluimos una muestra gratis.\n\n" +
                "Atentamente,\nEl Equipo de Malviaja2";

        enviarViaResend(emailDestino, asunto, mensaje);
    }

    public void enviarConfirmacionPedido(String emailDestino, String nombreCliente, Long pedidoId, Double total, String carritoJson) {
        String asunto = "🚀 ¡Pedido #" + pedidoId + " recibido! - Malviaja2";
        
        StringBuilder productosHtml = new StringBuilder();
        try {
            // Un poco de formato básico para el carrito
            productosHtml.append("<ul>");
            // No importo ObjectMapper aquí para no complicar, asumo que enviamos texto plano o algo simple por ahora
            productosHtml.append("<li>Detalle del pedido enviado a revisión</li>");
            productosHtml.append("</ul>");
        } catch (Exception e) {
            productosHtml.append("<p>Ver detalle en la app</p>");
        }

        String mensaje = "<h2>¡Hola " + nombreCliente + "!</h2>" +
                "<p>Hemos recibido tu pedido <b>#" + pedidoId + "</b> con éxito.</p>" +
                "<p><b>Total:</b> $" + String.format("%.0f", total) + "</p>" +
                "<p>Actualmente estamos revisando tu comprobante de pago. Te notificaremos por este medio cuando sea aceptado y comencemos con la preparación.</p>" +
                "<p>¡Gracias por confiar en Malviaja2! 🍫</p>" +
                "<hr><p><small>Este es un correo automático, no es necesario responder.</small></p>";

        enviarViaResend(emailDestino, asunto, mensaje);
    }
}
