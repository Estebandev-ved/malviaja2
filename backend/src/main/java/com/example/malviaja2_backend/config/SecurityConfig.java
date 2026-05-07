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

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost:5174}")
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
                .requestMatchers(HttpMethod.GET, "/api/productos").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/setup/make-admin").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/pedidos/checkout").authenticated()
                .requestMatchers(HttpMethod.GET, "/api/pedidos/usuario/**").authenticated()
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
