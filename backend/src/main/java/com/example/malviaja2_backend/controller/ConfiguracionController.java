package com.example.malviaja2_backend.controller;

import com.example.malviaja2_backend.model.ConfiguracionGlobal;
import com.example.malviaja2_backend.service.ConfiguracionService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracion")
public class ConfiguracionController {

    private final ConfiguracionService configuracionService;

    public ConfiguracionController(ConfiguracionService configuracionService) {
        this.configuracionService = configuracionService;
    }

    @GetMapping
    public ResponseEntity<ConfiguracionGlobal> obtenerConfig() {
        return ResponseEntity.ok(configuracionService.obtenerConfiguracion());
    }

    @GetMapping("/publica")
    public ResponseEntity<ConfiguracionGlobal> obtenerConfigPublica() {
        return ResponseEntity.ok(configuracionService.obtenerConfiguracion());
    }

    @PutMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<ConfiguracionGlobal> guardarConfig(@RequestBody ConfiguracionGlobal conf) {
        return ResponseEntity.ok(configuracionService.guardarConfiguracion(conf));
    }
}
