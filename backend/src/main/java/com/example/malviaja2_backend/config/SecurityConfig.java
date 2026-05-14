package com.example.malviaja2_backend.config;

import com.example.malviaja2_backend.repository.UsuarioRepository;
import com.example.malviaja2_backend.security.FirebaseAuthFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Orígenes permitidos: localhost para dev + URL de producción en Vercel y Render
    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:5174,https://malviaja2-qvce46ctq-estebandev-veds-projects.vercel.app,https://malviaja2.vercel.app}")
    private String allowedOriginsRaw;

    @Value("${cors.allowed-origin-patterns:https://*.vercel.app}")
    private String allowedOriginPatternsRaw;

    @Bean
    FirebaseAuthFilter firebaseAuthFilter(UsuarioRepository usuarioRepository, 
                                          com.example.malviaja2_backend.service.ConfiguracionService configuracionService,
                                          @Value("${app.admin.uid:}") String adminUid) {
        return new FirebaseAuthFilter(usuarioRepository, configuracionService, adminUid);
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            FirebaseAuthFilter firebaseAuthFilter) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos
                .requestMatchers(HttpMethod.GET, "/api/productos").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/productos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/logros").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/configuracion/publica").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/noticias/publicas").permitAll()
                .requestMatchers("/error").permitAll()
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Admin-only
                .requestMatchers(HttpMethod.GET, "/api/configuracion").hasAuthority("ADMIN")
                // SEGURIDAD: El endpoint /api/setup/make-admin fue ELIMINADO intencionalmente.
                // No debe existir ningún endpoint público de elevación de privilegios en producción.
                // Endpoints autenticados
                .requestMatchers(HttpMethod.POST, "/api/pedidos/checkout").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/pedidos/usuario/**").authenticated()
                // Endpoints solo ADMIN
                .requestMatchers(HttpMethod.GET,    "/api/pedidos/todos").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.GET,    "/api/pedidos/usuarios/todos").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/pedidos/*/estado").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/pedidos/usuarios/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/productos").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/productos/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasAuthority("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = Arrays.stream(allowedOriginsRaw.split(","))
                .map(String::trim)
                .filter(o -> !o.isBlank())
                .collect(Collectors.toList());
        List<String> originPatterns = Arrays.stream(allowedOriginPatternsRaw.split(","))
                .map(String::trim)
                .filter(o -> !o.isBlank())
                .collect(Collectors.toList());

        if (!origins.isEmpty()) {
            config.setAllowedOrigins(origins);
        }
        if (!originPatterns.isEmpty()) {
            config.setAllowedOriginPatterns(originPatterns);
        }
        if (origins.isEmpty() && originPatterns.isEmpty()) {
            config.setAllowedOriginPatterns(List.of("*"));
        }

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
