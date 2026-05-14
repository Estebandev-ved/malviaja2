package com.example.malviaja2_backend.config;

import com.example.malviaja2_backend.service.TelegramBotService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.telegram.telegrambots.meta.TelegramBotsApi;
import org.telegram.telegrambots.meta.api.methods.updates.DeleteWebhook;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import org.telegram.telegrambots.updatesreceivers.DefaultBotSession;

/**
 * Configuración del bot de Telegram.
 * SEGURIDAD: El registro del bot está envuelto en try-catch para que un token
 * inválido, una red caída o cualquier fallo de Telegram NO derrumbe el contexto
 * completo de Spring Boot. El resto del backend sigue funcionando aunque
 * Telegram no esté disponible.
 */
@Configuration
public class BotConfig {

    private static final Logger log = LoggerFactory.getLogger(BotConfig.class);

    @Bean
    public TelegramBotsApi telegramBotsApi(TelegramBotService telegramBotService) {
        boolean enabled = telegramBotService.getConfiguredBotToken() != null
                && !telegramBotService.getConfiguredBotToken().isBlank();
        if (!enabled) {
            log.info("Telegram desactivado: falta token o está vacío.");
            try {
                return new TelegramBotsApi(DefaultBotSession.class);
            } catch (TelegramApiException fallbackEx) {
                log.error("Error creando TelegramBotsApi sin bot: {}", fallbackEx.getMessage());
                return null;
            }
        }
        try {
            // Forzar eliminación de webhook previo (si existía) para evitar
            // conflictos con long polling
            try {
                telegramBotService.execute(new DeleteWebhook());
            } catch (Exception ignored) {
                // Si falla, no importa; el registro lo intentará de todas formas
            }

            TelegramBotsApi botsApi = new TelegramBotsApi(DefaultBotSession.class);
            botsApi.registerBot(telegramBotService);
            log.info("✅ Bot de Telegram registrado correctamente: @{}", telegramBotService.getBotUsername());
            return botsApi;
        } catch (TelegramApiException e) {
            // Un token inválido o fallo de red NO debe colapsar el backend completo.
            // Las notificaciones de Telegram se degradarán de forma silenciosa.
            log.warn("⚠️ No se pudo registrar el bot de Telegram. Las notificaciones estarán desactivadas. Error: {}", e.getMessage());
            try {
                // Devolver una API no registrada es suficiente para satisfacer el contexto de Spring
                return new TelegramBotsApi(DefaultBotSession.class);
            } catch (TelegramApiException fallbackEx) {
                log.error("Error crítico creando TelegramBotsApi de fallback: {}", fallbackEx.getMessage());
                return null;
            }
        }
    }
}
