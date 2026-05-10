package com.example.malviaja2_backend.service;

import com.example.malviaja2_backend.model.Usuario;
import com.example.malviaja2_backend.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class InactividadService {

    private final UsuarioRepository usuarioRepository;
    private final ConfiguracionService configuracionService;
    private final EmailNotificationService emailNotificationService;

    // Ejecutar todos los días a medianoche (o cada cierto tiempo, aquí puesto cada 6 horas)
    @Scheduled(fixedDelay = 21600000)
    @Transactional
    public void verificarInactividad() {
        int diasInactividad = configuracionService.obtenerConfiguracion().getDiasInactividad();
        LocalDateTime limite = LocalDateTime.now().minusDays(diasInactividad);

        List<Usuario> inactivos = usuarioRepository.findByActivoTrueAndUltimaCompraBefore(limite);
        if (!inactivos.isEmpty()) {
            for (Usuario u : inactivos) {
                u.setActivo(false);
                emailNotificationService.enviarNotificacionInactividad(u.getEmail(), u.getNombre());
            }
            usuarioRepository.saveAll(inactivos);
            log.info("Se han inactivado {} usuarios por falta de pedidos en los últimos {} días.", inactivos.size(), diasInactividad);
        }
    }
}
