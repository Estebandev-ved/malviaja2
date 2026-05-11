package com.example.malviaja2_backend.security;

import com.example.malviaja2_backend.model.Usuario;
import com.example.malviaja2_backend.repository.UsuarioRepository;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseToken;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class FirebaseAuthFilter extends OncePerRequestFilter {

    private final UsuarioRepository usuarioRepository;
    private final com.example.malviaja2_backend.service.ConfiguracionService configuracionService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            chain.doFilter(request, response);
            return;
        }

        String idToken = authHeader.substring(7).trim();
        if (idToken.isBlank()) {
            chain.doFilter(request, response);
            return;
        }

        try {
            FirebaseToken decodedToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String uid = decodedToken.getUid();
            String email = decodedToken.getEmail();
            String nombre = (String) decodedToken.getClaims().get("name");

            // Sincronizar con la BD local: si no existe, lo creamos
            Usuario usuario = null;
            try {
                usuario = usuarioRepository.findByFirebaseUid(uid).orElse(null);
                
                if (usuario == null) {
                    // Verificar límite de usuarios activos
                    long currentUsers = usuarioRepository.countByActivoTrue();
                    int maxUsers = configuracionService.obtenerConfiguracion().getMaxUsuarios();
                    
                    if (currentUsers >= maxUsers) {
                        log.warn("Intento de registro rechazado: Límite de {} usuarios alcanzado.", maxUsers);
                        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Club lleno. No se aceptan nuevos miembros.");
                        return;
                    }
                    
                    usuario = new Usuario();
                    usuario.setFirebaseUid(uid);
                    usuario.setEmail(email != null ? email : "usuario@sin-email.com");
                    usuario.setNombre(nombre != null ? nombre : "Usuario Malviajado");
                    log.info("Sincronizando nuevo usuario desde Firebase: {}", email);
                    usuario = usuarioRepository.save(usuario);
                }
            } catch (Exception syncEx) {
                log.error("Error al sincronizar usuario con la BD: {}", syncEx.getMessage());
                // Si es el admin, no lo bloqueamos
                if (!"QHjKOXbmDidS1IyyWBJwrH70YSZ2".equals(uid)) {
                    throw syncEx; // Relanzar para usuarios normales
                }
            }

            String rolAsignado = usuario != null ? usuario.getRol() : "USER";
            
            // Hardcode del UID del administrador principal
            if ("QHjKOXbmDidS1IyyWBJwrH70YSZ2".equals(uid)) {
                rolAsignado = "ADMIN";
                if (usuario != null && !"ADMIN".equals(usuario.getRol())) {
                    try {
                        usuario.setRol("ADMIN");
                        usuarioRepository.save(usuario);
                    } catch (Exception dbEx) {
                        log.warn("No se pudo actualizar el rol a ADMIN en la BD para el master UID, pero se le otorga acceso en memoria. Error: {}", dbEx.getMessage());
                    }
                }
            }

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    uid, null, List.of(new SimpleGrantedAuthority(rolAsignado))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            log.warn("Token Firebase inválido [{}]: {}", request.getRequestURI(), e.getMessage());
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}
