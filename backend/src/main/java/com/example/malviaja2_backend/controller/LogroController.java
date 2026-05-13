package com.example.malviaja2_backend.controller;

import com.example.malviaja2_backend.model.Logro;
import com.example.malviaja2_backend.model.UsuarioLogro;
import com.example.malviaja2_backend.repository.LogroRepository;
import com.example.malviaja2_backend.repository.UsuarioLogroRepository;
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
public class LogroController {

    private final LogroRepository logroRepository;
    private final UsuarioLogroRepository usuarioLogroRepository;

    @GetMapping("/logros")
    public ResponseEntity<List<Logro>> listarLogros() {
        return ResponseEntity.ok(logroRepository.findAll());
    }

    @GetMapping("/usuarios/{uid}/logros")
    public ResponseEntity<List<UsuarioLogro>> listarLogrosUsuario(@PathVariable String uid) {
        return ResponseEntity.ok(usuarioLogroRepository.findByUsuarioUidOrderByFechaObtenidoDesc(uid));
    }

    @PostMapping("/logros/reclamar")
    public ResponseEntity<?> reclamarLogro(@RequestBody Map<String, String> body) {
        String usuarioUid = body.get("usuarioUid");
        Long logroId = Long.parseLong(body.get("logroId"));

        if (usuarioLogroRepository.existsByUsuarioUidAndLogroId(usuarioUid, logroId)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Ya tienes este logro"));
        }

        UsuarioLogro ul = new UsuarioLogro();
        ul.setUsuarioUid(usuarioUid);
        ul.setLogroId(logroId);
        usuarioLogroRepository.save(ul);

        log.info("Usuario {} obtuvo logro #{}", usuarioUid, logroId);
        return ResponseEntity.ok(Map.of("mensaje", "Logro obtenido"));
    }
}
