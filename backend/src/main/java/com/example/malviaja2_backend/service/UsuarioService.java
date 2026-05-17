package com.example.malviaja2_backend.service;

import com.example.malviaja2_backend.model.Usuario;
import com.example.malviaja2_backend.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    private static final Logger log = LoggerFactory.getLogger(UsuarioService.class);

    private final UsuarioRepository usuarioRepository;
    private final EmailNotificationService emailService;

    public UsuarioService(UsuarioRepository usuarioRepository, EmailNotificationService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.emailService = emailService;
    }

    public List<Usuario> obtenerLeads() {
        return usuarioRepository.findByPrimerCompraRealizadaFalse();
    }

    @Transactional
    public void enviarEmailRecuperacion(Long usuarioId) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado con ID: " + usuarioId));

        if (usuario.getPrimerCompraRealizada()) {
            throw new IllegalStateException("El usuario ya realizó una compra.");
        }

        emailService.enviarEmailRecuperacion(usuario.getEmail(), usuario.getNombre());
        usuario.setRecoveryEmailSent(true);
        usuarioRepository.save(usuario);
        
        log.info("Email de recuperación enviado y marcado para usuario: {} ({})", usuario.getNombre(), usuario.getEmail());
    }
}
