package com.example.malviaja2_backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.beans.factory.annotation.Value;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Slf4j
@Configuration
public class FirebaseConfig {

    @Value("${FIREBASE_CREDENTIALS:#{null}}")
    private String firebaseCredentialsJson;

    @PostConstruct
    public void initialize() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }
        try {
            FirebaseOptions options;
            
            if (firebaseCredentialsJson != null && !firebaseCredentialsJson.trim().isEmpty()) {
                // 1. Usar variable de entorno (Para Render / Producción)
                // Render a veces escapa los saltos de línea y agrega comillas extras
                String processedJson = firebaseCredentialsJson
                    .replace("\\n", "\n")
                    .replace("\\\"", "\"");
                
                // Si el JSON viene envuelto en comillas simples o dobles extra al principio y al final, las quitamos
                if (processedJson.startsWith("\"") && processedJson.endsWith("\"") && processedJson.length() > 2) {
                    processedJson = processedJson.substring(1, processedJson.length() - 1);
                }
                if (processedJson.startsWith("'") && processedJson.endsWith("'") && processedJson.length() > 2) {
                    processedJson = processedJson.substring(1, processedJson.length() - 1);
                }

                InputStream credentialsStream = new ByteArrayInputStream(processedJson.getBytes(StandardCharsets.UTF_8));
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                        .build();
                log.info("Firebase Admin SDK inicializado usando la variable de entorno FIREBASE_CREDENTIALS.");
            } else {
                // 2. Usar archivo local (Para Desarrollo)
                InputStream serviceAccount = getClass().getClassLoader()
                        .getResourceAsStream("firebase-service-account.json");
                
                if (serviceAccount != null) {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                    log.info("Firebase Admin SDK inicializado con archivo firebase-service-account.json.");
                } else {
                    // 3. Fallback
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.getApplicationDefault())
                            .build();
                    log.info("Firebase Admin SDK inicializado con Application Default Credentials.");
                }
            }
            FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo inicializar Firebase Admin SDK.", e);
        }
    }
}
