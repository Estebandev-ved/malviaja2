package com.example.malviaja2_backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailNotificationService {

    private static final Logger log = LoggerFactory.getLogger(EmailNotificationService.class);

    // Aquí inyectaríamos JavaMailSender en el futuro, pero por simplicidad
    // y seguridad (evitar exponer tu clave), por ahora simularemos el envío.

    public void enviarNotificacionInactividad(String emailDestino, String nombreCliente) {
        String asunto = "⚠️ Tu cuenta de Malviaja2 está inactiva";
        String mensaje = "Hola " + nombreCliente + ",\n\n" +
                "Notamos que llevas más de 15 días sin hacer un pedido. " +
                "Como somos un club de acceso limitado (máximo 50 personas), " +
                "hemos puesto tu cuenta en modo inactivo para ceder el cupo a alguien más.\n\n" +
                "Para recuperar tus beneficios VIP y volver al club, realiza un pedido " +
                "de mínimo $15.000 COP hoy mismo.\n\n" +
                "Atentamente,\nEl Equipo de Malviaja2";

        // TODO: Reemplazar con lógica real de envío de correo (ej: JavaMailSender)
        log.info("📧 [SIMULADOR EMAIL] Enviando a: {}", emailDestino);
        log.info("Asunto: {}", asunto);
        log.info("Mensaje: \n{}", mensaje);
    }
    
    public void enviarPromocion(String emailDestino, String nombreCliente, String promo) {
        log.info("📧 [SIMULADOR EMAIL] Promoción para: {} -> {}", emailDestino, promo);
    }

    public void enviarEstadoPedido(String emailDestino, String nombreCliente, Long pedidoId, String estado, String motivo, String comprobanteUrl) {
        String asunto;
        StringBuilder mensaje = new StringBuilder();

        if ("CANCELADO".equals(estado)) {
            asunto = "❌ Pedido #" + pedidoId + " rechazado";
            mensaje.append("Hola ").append(nombreCliente).append(",\n\n")
                    .append("Tu pedido #").append(pedidoId).append(" fue rechazado.\n")
                    .append("Motivo: ").append(motivo == null || motivo.isBlank() ? "No especificado" : motivo)
                    .append("\n\n")
                    .append("Si deseas, puedes reenviar el comprobante y crear un nuevo pedido.\n");
            if (comprobanteUrl != null && !comprobanteUrl.isBlank()) {
                mensaje.append("\nVista de referencia: ").append(comprobanteUrl).append("\n");
            }
        } else {
            asunto = "✅ Pedido #" + pedidoId + " aceptado";
            mensaje.append("Hola ").append(nombreCliente).append(",\n\n")
                    .append("Tu pedido #").append(pedidoId).append(" fue aceptado y está en preparación.\n")
                    .append("Te avisaremos cuando salga a reparto.\n");
        }

        mensaje.append("\nAtentamente,\nEl Equipo de Malviaja2");

        log.info("📧 [SIMULADOR EMAIL] Enviando a: {}", emailDestino);
        log.info("Asunto: {}", asunto);
        log.info("Mensaje: \n{}", mensaje);
    }
}
