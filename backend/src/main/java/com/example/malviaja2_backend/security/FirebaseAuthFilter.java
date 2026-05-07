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
            Usuario usuario = usuarioRepository.findByFirebaseUid(uid)
                    .orElseGet(() -> {
                        Usuario nuevo = new Usuario();
                        nuevo.setFirebaseUid(uid);
                        nuevo.setEmail(email != null ? email : "usuario@sin-email.com");
                        nuevo.setNombre(nombre != null ? nombre : "Usuario Malviajado");
                        log.info("Sincronizando nuevo usuario desde Firebase: {}", email);
                        return usuarioRepository.save(nuevo);
                    });

            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    uid, null, List.of(new SimpleGrantedAuthority(usuario.getRol()))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);

        } catch (Exception e) {
            log.warn("Token Firebase inválido [{}]: {}", request.getRequestURI(), e.getMessage());
            SecurityContextHolder.clearContext();
        }

        chain.doFilter(request, response);
    }
}
