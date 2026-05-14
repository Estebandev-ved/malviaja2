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
        log.warn("Intento de acceso a webhook Nequi (deshabilitado temporalmente): {}", payload);
        return ResponseEntity.status(503).body(Map.of("error", "Webhook de pagos temporalmente deshabilitado por mantenimiento."));
    }
}
