package com.example.malviaja2_backend.controller;

import com.example.malviaja2_backend.model.Usuario;
import com.example.malviaja2_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/setup")
@RequiredArgsConstructor
public class AdminSetupController {

    private final UsuarioRepository usuarioRepository;

    private static final String SECRET = "malviaja2-setup-2024";

    @PostMapping("/make-admin")
    public ResponseEntity<String> makeAdmin(@RequestParam String email,
                                            @RequestParam String secret) {
        if (!SECRET.equals(secret)) {
            return ResponseEntity.status(403).body("Clave incorrecta.");
        }

        Optional<Usuario> opt = usuarioRepository.findAll().stream()
                .filter(u -> email.equalsIgnoreCase(u.getEmail()))
                .findFirst();

        if (opt.isEmpty()) {
            return ResponseEntity.status(404).body("Usuario no encontrado: " + email);
        }

        Usuario usuario = opt.get();
        usuario.setRol("ADMIN");
        usuarioRepository.save(usuario);
        return ResponseEntity.ok("✅ " + email + " ahora es ADMIN.");
    }
}
