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

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    // Orígenes permitidos: localhost para dev + URL de producción en Vercel y Render
    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:5174,https://malviaja2-qvce46ctq-estebandev-veds-projects.vercel.app,https://malviaja2.vercel.app}")
    private String allowedOriginsRaw;

    @Bean
    FirebaseAuthFilter firebaseAuthFilter(UsuarioRepository usuarioRepository) {
        return new FirebaseAuthFilter(usuarioRepository);
    }

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http,
                                            FirebaseAuthFilter firebaseAuthFilter) throws Exception {
        List<String> allowedOrigins = Arrays.asList(allowedOriginsRaw.split(","));

        http
            .cors(cors -> cors.configurationSource(request -> {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(allowedOrigins);
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                return config;
            }))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos
                .requestMatchers(HttpMethod.GET, "/api/productos").permitAll()
                // SEGURIDAD: El endpoint /api/setup/make-admin fue ELIMINADO intencionalmente.
                // No debe existir ningún endpoint público de elevación de privilegios en producción.
                // Endpoints autenticados
                .requestMatchers(HttpMethod.POST, "/api/pedidos/checkout").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/pedidos/usuario/**").authenticated()
                // Endpoints solo ADMIN
                .requestMatchers(HttpMethod.GET,    "/api/pedidos/todos").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.GET,    "/api/pedidos/usuarios/todos").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/pedidos/usuarios/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.POST,   "/api/productos").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.PUT,    "/api/productos/**").hasAuthority("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/productos/**").hasAuthority("ADMIN")
                .anyRequest().authenticated()
            )
            .addFilterBefore(firebaseAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
