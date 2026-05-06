package com.example.malviaja2_backend.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;

@Slf4j
@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }
        try {
            InputStream serviceAccount = getClass().getClassLoader()
                    .getResourceAsStream("firebase-service-account.json");

            FirebaseOptions options;
            if (serviceAccount != null) {
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();
                log.info("Firebase Admin SDK inicializado con service account.");
            } else {
                // Fallback para entornos cloud (Google Cloud Run, App Engine, etc.)
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.getApplicationDefault())
                        .build();
                log.info("Firebase Admin SDK inicializado con Application Default Credentials.");
            }
            FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo inicializar Firebase Admin SDK. " +
                    "Asegúrate de tener firebase-service-account.json en src/main/resources.", e);
        }
    }
}
