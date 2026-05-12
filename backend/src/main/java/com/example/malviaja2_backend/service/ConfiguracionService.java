package com.example.malviaja2_backend.service;

import com.example.malviaja2_backend.model.ConfiguracionGlobal;
import com.example.malviaja2_backend.repository.ConfiguracionGlobalRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ConfiguracionService {

    private final ConfiguracionGlobalRepository repository;

    @PostConstruct
    public void init() {
        try {
            if (!repository.existsById(1L)) {
                ConfiguracionGlobal conf = new ConfiguracionGlobal();
                repository.save(conf);
                log.info("Configuración Global inicializada por defecto.");
            }
        } catch (Exception e) {
            // La tabla puede no existir todavía si Hibernate aún no la creó
            log.warn("No se pudo inicializar ConfiguracionGlobal en startup (será reintentado en la primera petición): {}", e.getMessage());
        }
    }

    public ConfiguracionGlobal obtenerConfiguracion() {
        return repository.findById(1L).orElseGet(() -> {
            ConfiguracionGlobal conf = new ConfiguracionGlobal();
            return repository.save(conf);
        });
    }

    public ConfiguracionGlobal guardarConfiguracion(ConfiguracionGlobal conf) {
        conf.setId(1L); // Garantizar singleton
        return repository.save(conf);
    }
}
