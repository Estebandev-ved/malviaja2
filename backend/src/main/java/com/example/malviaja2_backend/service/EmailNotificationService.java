package com.example.malviaja2_backend.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailNotificationService {

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
}
