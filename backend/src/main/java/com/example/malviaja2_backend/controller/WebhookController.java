package com.example.malviaja2_backend.controller;

import com.example.malviaja2_backend.service.PedidoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/webhook")
public class WebhookController {

    private final PedidoService pedidoService;
    private static final Logger log = LoggerFactory.getLogger(WebhookController.class);

    public WebhookController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @PostMapping("/nequi")
    public ResponseEntity<?> webhookNequi(@RequestBody Map<String, Object> payload) {
        log.info("📡 Webhook Nequi recibido: {}", payload);

        try {
            String referencia = (String) payload.getOrDefault("referencia", "");
            Double monto = payload.get("monto") != null
                    ? Double.valueOf(payload.get("monto").toString())
                    : null;
            String estado = (String) payload.getOrDefault("estado", "EXITOSO");

            if (referencia.isEmpty() || monto == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "referencia y monto son requeridos"));
            }

            var pedidoOpt = pedidoService.obtenerPorReferencia(referencia);
            if (pedidoOpt.isEmpty()) {
                log.warn("Webhook: pedido con referencia {} no encontrado", referencia);
                return ResponseEntity.notFound().build();
            }

            var pedido = pedidoOpt.get();
            if (!"PENDIENTE".equals(pedido.getEstado())) {
                log.info("Webhook: pedido {} ya fue procesado (estado={})", referencia, pedido.getEstado());
                return ResponseEntity.ok(Map.of("mensaje", "Pedido ya procesado"));
            }

            if (!"EXITOSO".equals(estado)) {
                log.warn("Webhook: pago no exitoso para referencia {}", referencia);
                return ResponseEntity.ok(Map.of("mensaje", "Pago no exitoso, no se actualiza el pedido"));
            }

            if (Math.round(monto) != Math.round(pedido.getTotal())) {
                log.warn("Webhook: monto {} no coincide con total del pedido {}", monto, pedido.getTotal());
                return ResponseEntity.badRequest().body(Map.of("error", "Monto no coincide con el pedido"));
            }

            pedidoService.actualizarEstado(pedido.getId(), "PAGADO", "Pago automático vía webhook Nequi");
            log.info("✅ Pedido {} aprobado automáticamente vía webhook Nequi", referencia);

            return ResponseEntity.ok(Map.of(
                    "mensaje", "Pedido actualizado a PAGADO exitosamente",
                    "pedidoId", pedido.getId(),
                    "referencia", referencia
            ));
        } catch (Exception e) {
            log.error("Error procesando webhook Nequi", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Error interno: " + e.getMessage()));
        }
    }
}
