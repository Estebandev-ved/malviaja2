package com.example.malviaja2_backend.service;

import com.example.malviaja2_backend.model.Pedido;
import com.example.malviaja2_backend.model.PedidoRequest;
import com.example.malviaja2_backend.model.Usuario;
import com.example.malviaja2_backend.repository.PedidoRepository;
import com.example.malviaja2_backend.repository.UsuarioRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.telegram.telegrambots.meta.api.methods.send.SendPhoto;
import org.telegram.telegrambots.meta.api.objects.InputFile;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.InlineKeyboardMarkup;
import org.telegram.telegrambots.meta.api.objects.replykeyboard.buttons.InlineKeyboardButton;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final TelegramBotService telegramBotService;
    private final ObjectMapper objectMapper;

    @Transactional
    public Pedido procesarCheckout(PedidoRequest request, MultipartFile comprobante) throws Exception {
        Usuario usuario = usuarioRepository.findByFirebaseUid(request.getUserId())
                .orElseGet(() -> {
                    Usuario nuevo = new Usuario();
                    nuevo.setFirebaseUid(request.getUserId());
                    nuevo.setEmail(request.getEmail() != null ? request.getEmail() : "usuario@malviaja2.com");
                    nuevo.setNombre(request.getNombre());
                    return usuarioRepository.save(nuevo);
                });

        usuario.setDireccionPorDefecto(request.getDireccion());
        usuario.setTelefonoPorDefecto(request.getTelefono());
        usuarioRepository.save(usuario);

        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setNombreReceptor(request.getNombre());
        pedido.setTelefono(request.getTelefono());
        pedido.setDireccionEnvio(request.getDireccion());
        pedido.setTotal(request.getTotal());
        pedido.setCarritoJson(request.getCarrito());
        pedido.setEstado("PENDIENTE");
        pedido = pedidoRepository.save(pedido);
        log.info("Pedido #{} guardado en BD.", pedido.getId());

        notificarTelegram(pedido, request, comprobante);
        return pedido;
    }

    public List<Pedido> obtenerHistorial(String firebaseUid) {
        return usuarioRepository.findByFirebaseUid(firebaseUid)
                .map(pedidoRepository::findByUsuarioOrderByFechaPedidoDesc)
                .orElse(List.of());
    }

    public Page<Pedido> obtenerTodos(Pageable pageable) {
        return pedidoRepository.findAll(pageable);
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
