package com.example.malviaja2_backend.controller;

import com.example.malviaja2_backend.model.Resena;
import com.example.malviaja2_backend.service.ResenaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ResenaController {

    private final ResenaService resenaService;

    @GetMapping("/productos/{productoId}/resenas")
    public ResponseEntity<List<Resena>> listarResenas(@PathVariable Long productoId) {
        return ResponseEntity.ok(resenaService.obtenerPorProducto(productoId));
    }

    @GetMapping("/productos/{productoId}/resenas/resumen")
    public ResponseEntity<Map<String, Object>> resumenResenas(@PathVariable Long productoId) {
        return ResponseEntity.ok(resenaService.obtenerResumen(productoId));
    }

    @PostMapping("/productos/{productoId}/resenas")
    public ResponseEntity<?> crearResena(@PathVariable Long productoId, @RequestBody Resena resena,
                                          Authentication auth) {
        String uid = auth.getName();
        resena.setUsuarioUid(uid);
        resena.setProductoId(productoId);
        try {
            return ResponseEntity.ok(resenaService.crearResena(resena));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/resenas/{id}")
    public ResponseEntity<?> eliminarResena(@PathVariable Long id, Authentication auth) {
        String uid = auth.getName();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ADMIN"));
        var optResena = resenaService.buscarPorId(id);
        if (optResena.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Resena resena = optResena.get();
        if (!isAdmin && !resena.getUsuarioUid().equals(uid)) {
            return ResponseEntity.status(403).body(Map.of("error", "No puedes eliminar una reseña de otro usuario"));
        }
        resenaService.eliminar(id);
        return ResponseEntity.ok(Map.of("mensaje", "Reseña eliminada correctamente."));
    }

    @GetMapping("/usuarios/{uid}/resenas")
    public ResponseEntity<List<Resena>> listarResenasUsuario(@PathVariable String uid) {
        return ResponseEntity.ok(resenaService.obtenerPorUsuario(uid));
    }
}
