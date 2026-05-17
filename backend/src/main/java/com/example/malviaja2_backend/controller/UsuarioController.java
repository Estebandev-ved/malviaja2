package com.example.malviaja2_backend.controller;

import com.example.malviaja2_backend.model.Usuario;
import com.example.malviaja2_backend.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/leads")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Usuario>> obtenerLeads() {
        return ResponseEntity.ok(usuarioService.obtenerLeads());
    }

    @PostMapping("/leads/{id}/recuperar")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> enviarEmailRecuperacion(@PathVariable Long id) {
        try {
            usuarioService.enviarEmailRecuperacion(id);
            return ResponseEntity.ok(Map.of("mensaje", "Email de recuperación enviado con éxito."));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", "Error al enviar el email."));
        }
    }
}
