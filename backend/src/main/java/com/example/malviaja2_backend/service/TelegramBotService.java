package com.example.malviaja2_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.telegram.telegrambots.bots.TelegramLongPollingBot;
import org.telegram.telegrambots.meta.api.methods.send.SendMessage;
import org.telegram.telegrambots.meta.api.objects.Update;
import org.telegram.telegrambots.meta.exceptions.TelegramApiException;
import lombok.extern.slf4j.Slf4j;

import com.example.malviaja2_backend.model.Pedido;
import com.example.malviaja2_backend.repository.PedidoRepository;
import org.telegram.telegrambots.meta.api.methods.updatingmessages.EditMessageCaption;
import org.telegram.telegrambots.meta.api.objects.CallbackQuery;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;
import java.util.Optional;
import java.util.List;
import java.util.ArrayList;

@Slf4j
@Service
public class TelegramBotService extends TelegramLongPollingBot {

    /**
     * FIX: TelegramLongPollingBot requiere el token en el CONSTRUCTOR.
     * Los campos @Value se inyectan DESPUÉS de la construcción, lo que causaría
     * que getBotToken() devuelva null al momento de registrar el bot → NullPointerException.
     * Solución: inyectar por constructor con @Value directamente en el parámetro.
     */
    private final String botUsername;
    private final String adminChatId;
    private final PedidoRepository pedidoRepository;
    private final EmailNotificationService emailNotificationService;

    public TelegramBotService(
            @Value("${telegram.bot.token}") String botToken,
            @Value("${telegram.bot.username}") String botUsername,
            @Value("${telegram.bot.admin-chat-id:}") String adminChatId,
            PedidoRepository pedidoRepository,
            EmailNotificationService emailNotificationService) {
        super(botToken); // Pasa el token al constructor base → disponible desde el inicio
        this.botUsername = botUsername;
        this.adminChatId = adminChatId;
        this.pedidoRepository = pedidoRepository;
        this.emailNotificationService = emailNotificationService;
        log.info("✅ TelegramBotService inicializado correctamente. Username: {}", botUsername);
    }

    public String getAdminChatId() {
        return adminChatId;
    }

    @Override
    public String getBotUsername() {
        return botUsername;
    }

    // getBotToken() es manejado internamente por TelegramLongPollingBot
    // al pasar el token en el constructor super(botToken)

    @Override
    public void onUpdateReceived(Update update) {
        if (update.hasMessage() && update.getMessage().hasText()) {
            String messageText = update.getMessage().getText();
            Long chatId = update.getMessage().getChatId();

            log.info("Mensaje recibido de {}: {}", update.getMessage().getFrom().getUserName(), messageText);

            if (messageText.equals("/start")) {
                log.info("==========================================");
                log.info("TU CHAT ID ES: {}", chatId);
                log.info("==========================================");
                
                SendMessage response = new SendMessage();
                response.setChatId(String.valueOf(chatId));
                response.setText("¡Hola Admin! Tu CHAT ID es: " + chatId + "\nPon este número en tu application.properties");
                
                try {
                    execute(response);
                } catch (TelegramApiException e) {
                    log.error("Error al enviar el mensaje de bienvenida", e);
                }
            }
        } else if (update.hasCallbackQuery()) {
            CallbackQuery callbackQuery = update.getCallbackQuery();
            String data = callbackQuery.getData();
            String chatId = callbackQuery.getMessage().getChatId().toString();
            Integer messageId = callbackQuery.getMessage().getMessageId();
            String caption = callbackQuery.getMessage().getCaption();

            log.info("Boton presionado: {}", data);

            try {
                String[] parts = data.split("_");
                if (parts.length < 2) {
                    log.warn("Callback con formato inesperado ignorado: {}", data);
                    return;
                }
                String action = parts[0];
                Long pedidoId = Long.parseLong(parts[1]);

                Optional<Pedido> pedidoOpt = pedidoRepository.findById(pedidoId);
                if (pedidoOpt.isPresent()) {
                    Pedido pedido = pedidoOpt.get();
                    String statusMsg = "";
                    InlineKeyboardMarkup nextMarkup = null;

                    switch (action) {
                        case "ACEPTAR":
                            pedido.setEstado("PREPARANDO");
                            statusMsg = "👨‍🍳 *Preparando tu viaje*";
                            // Acreditar puntos de fidelidad
                            if (pedido.getUsuario() != null && pedido.getTotal() != null) {
                                int puntos = (int) Math.round(pedido.getTotal() / 100);
                                pedido.getUsuario().setPuntos(pedido.getUsuario().getPuntos() + puntos);
                                log.info("🏆 {} puntos acreditados por Telegram al usuario del pedido #{}", puntos, pedido.getId());
                            }
                            try {
                                String email = pedido.getUsuario() != null ? pedido.getUsuario().getEmail() : null;
                                String nombre = pedido.getNombreReceptor() != null ? pedido.getNombreReceptor() : "Cliente";
                                emailNotificationService.enviarEstadoPedido(email, nombre, pedido.getId(), "PREPARANDO", null, null);
                            } catch (Exception ignored) {}
                            // Siguiente paso: Enviar a repartición
                            nextMarkup = new InlineKeyboardMarkup();
                            List<List<InlineKeyboardButton>> rows = new ArrayList<>();
                            List<InlineKeyboardButton> row = new ArrayList<>();
                            InlineKeyboardButton btnReparticion = new InlineKeyboardButton();
                            btnReparticion.setText("🛵 Enviar a Repartición");
                            btnReparticion.setCallbackData("ENCAMINO_" + pedido.getId());
                            row.add(btnReparticion);
                            rows.add(row);
                            nextMarkup.setKeyboard(rows);
                            break;

                        case "ENCAMINO":
                            pedido.setEstado("EN_CAMINO");
                            statusMsg = "🛵 *El repartidor va en camino*";
                            
                            // Siguiente paso: Marcar entregado
                            nextMarkup = new InlineKeyboardMarkup();
                            List<List<InlineKeyboardButton>> rows2 = new ArrayList<>();
                            List<InlineKeyboardButton> row2 = new ArrayList<>();
                            InlineKeyboardButton btnEntregado = new InlineKeyboardButton();
                            btnEntregado.setText("🏠 Marcar como Entregado");
                            btnEntregado.setCallbackData("ENTREGADO_" + pedido.getId());
                            row2.add(btnEntregado);
                            rows2.add(row2);
                            nextMarkup.setKeyboard(rows2);
                            break;

                        case "ENTREGADO":
                            pedido.setEstado("ENTREGADO");
                            statusMsg = "🏠 *¡Entregado con éxito!*";
                            nextMarkup = null; // No más botones
                            break;

                        case "RECHAZAR":
                            pedido.setEstado("CANCELADO");
                            statusMsg = "❌ *Pedido Rechazado*";
                            nextMarkup = null; // No más botones
                            try {
                                String email = pedido.getUsuario() != null ? pedido.getUsuario().getEmail() : null;
                                String nombre = pedido.getNombreReceptor() != null ? pedido.getNombreReceptor() : "Cliente";
                                emailNotificationService.enviarEstadoPedido(email, nombre, pedido.getId(), "CANCELADO", "Rechazado por admin vía Telegram", null);
                            } catch (Exception ignored) {}
                            break;
                    }
                    
                    pedidoRepository.save(pedido);

                    // Editar el mensaje para mostrar el nuevo estado y los nuevos botones
                    EditMessageCaption editMessage = new EditMessageCaption();
                    editMessage.setChatId(chatId);
                    editMessage.setMessageId(messageId);
                    editMessage.setCaption(caption + "\n\n------------------\n📍 *ESTADO:* " + statusMsg);
                    editMessage.setParseMode("Markdown");
                    editMessage.setReplyMarkup(nextMarkup); // Se actualiza con el nuevo teclado

                    execute(editMessage);
                }
            } catch (Exception e) {
                log.error("Error procesando callback", e);
            }
        }
    }

    public void enviarMensaje(String chatId, String texto) {
        SendMessage message = new SendMessage();
        message.setChatId(chatId);
        message.setText(texto);

        try {
            execute(message);
        } catch (TelegramApiException e) {
            log.error("Error al enviar mensaje a Telegram", e);
        }
    }
}
