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
        if (!repository.existsById(1L)) {
            ConfiguracionGlobal conf = new ConfiguracionGlobal();
            repository.save(conf);
            log.info("Configuración Global inicializada por defecto.");
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
