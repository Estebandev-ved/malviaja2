package com.example.malviaja2_backend.controller;

import com.example.malviaja2_backend.model.Resena;
import com.example.malviaja2_backend.service.ResenaService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<?> crearResena(@PathVariable Long productoId, @RequestBody Resena resena) {
        resena.setProductoId(productoId);
        try {
            return ResponseEntity.ok(resenaService.crearResena(resena));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/resenas/{id}")
    public ResponseEntity<?> eliminarResena(@PathVariable Long id) {
        if (resenaService.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        resenaService.eliminar(id);
        return ResponseEntity.ok(Map.of("mensaje", "Reseña eliminada correctamente."));
    }

    @GetMapping("/usuarios/{uid}/resenas")
    public ResponseEntity<List<Resena>> listarResenasUsuario(@PathVariable String uid) {
        return ResponseEntity.ok(resenaService.obtenerPorUsuario(uid));
    }
}
