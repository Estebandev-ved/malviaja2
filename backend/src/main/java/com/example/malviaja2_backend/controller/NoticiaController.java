package com.example.malviaja2_backend.controller;

import com.example.malviaja2_backend.model.Noticia;
import com.example.malviaja2_backend.repository.NoticiaRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/noticias")
public class NoticiaController {

    private final NoticiaRepository noticiaRepository;

    public NoticiaController(NoticiaRepository noticiaRepository) {
        this.noticiaRepository = noticiaRepository;
    }

    @GetMapping("/publicas")
    public ResponseEntity<List<Noticia>> listarPublicas() {
        return ResponseEntity.ok(noticiaRepository.findByActivoTrueOrderByFechaDesc());
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Noticia>> listarTodas() {
        return ResponseEntity.ok(noticiaRepository.findAllByOrderByFechaDesc());
    }

    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Noticia> crear(@RequestBody Noticia noticia) {
        if (noticia.getFecha() == null) {
            noticia.setFecha(LocalDate.now());
        }
        return ResponseEntity.ok(noticiaRepository.save(noticia));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Noticia> actualizar(@PathVariable Long id, @RequestBody Noticia noticia) {
        return noticiaRepository.findById(id)
                .map(existente -> {
                    existente.setTitulo(noticia.getTitulo());
                    existente.setDescripcion(noticia.getDescripcion());
                    existente.setTipo(noticia.getTipo());
                    existente.setActivo(noticia.getActivo());
                    if (noticia.getFecha() != null) {
                        existente.setFecha(noticia.getFecha());
                    }
                    return ResponseEntity.ok(noticiaRepository.save(existente));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!noticiaRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        noticiaRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
