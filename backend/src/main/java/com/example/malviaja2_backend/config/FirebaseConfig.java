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

    @Value("${FIREBASE_CONFIG_PATH:#{null}}")
    private String firebaseConfigPath;

    @PostConstruct
    public void initialize() {
        if (!FirebaseApp.getApps().isEmpty()) {
            return;
        }
        try {
            FirebaseOptions options;
            
            if (firebaseCredentialsJson != null && !firebaseCredentialsJson.trim().isEmpty()) {
                // 1. Usar variable de entorno con Base64 (Para Render / Producción)
                try {
                    String base64Credentials = firebaseCredentialsJson.trim();
                    byte[] decodedBytes = java.util.Base64.getDecoder().decode(base64Credentials);
                    InputStream credentialsStream = new ByteArrayInputStream(decodedBytes);
                    
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(credentialsStream))
                            .build();
                    log.info("Firebase Admin SDK inicializado usando la variable de entorno FIREBASE_CREDENTIALS (Base64).");
                } catch (IllegalArgumentException base64Ex) {
                    log.warn("La variable FIREBASE_CREDENTIALS no esta en formato Base64. Intentando leerla como JSON plano...");
                    
                    String processedJson = firebaseCredentialsJson.replace("\\n", "\n").replace("\\\"", "\"");
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
                    log.info("Firebase Admin SDK inicializado usando la variable de entorno FIREBASE_CREDENTIALS (JSON Plano).");
                }
            } else if (firebaseConfigPath != null && !firebaseConfigPath.trim().isEmpty()) {
                // 2. Usar ruta de archivo especificada (Útil para Secret Files en Render)
                try (InputStream serviceAccount = new java.io.FileInputStream(firebaseConfigPath)) {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                    log.info("Firebase Admin SDK inicializado usando la ruta: {}", firebaseConfigPath);
                } catch (IOException e) {
                    log.error("No se pudo leer el archivo de credenciales en la ruta: {}", firebaseConfigPath);
                    throw e;
                }
            } else {
                // 3. Buscar archivo de credenciales en múltiples ubicaciones
                log.info("🔍 Buscando archivo firebase-service-account.json...");
                InputStream serviceAccount = null;
                
                String[] possiblePaths = {
                    "/etc/secrets/firebase-service-account.json",
                    "firebase-service-account.json",
                    "backend/src/main/resources/firebase-service-account.json"
                };
                
                for (String path : possiblePaths) {
                    java.io.File file = new java.io.File(path);
                    if (file.exists()) {
                        serviceAccount = new java.io.FileInputStream(file);
                        log.info("✅ ¡Encontrado en filesystem!: {}", path);
                        break;
                    }
                }
                
                // DEBUG: Si no existe en la ruta de Render, listamos qué HAY ahí
                if (serviceAccount == null) {
                    java.io.File secretsDir = new java.io.File("/etc/secrets");
                    if (secretsDir.exists() && secretsDir.isDirectory()) {
                        String[] files = secretsDir.list();
                        log.warn("⚠️ No se encontró el archivo en /etc/secrets/. Los archivos disponibles son: {}", 
                            (files != null && files.length > 0) ? String.join(", ", files) : "NINGUNO");
                    }
                }
                
                if (serviceAccount == null) {
                    serviceAccount = getClass().getClassLoader().getResourceAsStream("firebase-service-account.json");
                    if (serviceAccount != null) log.info("✅ Encontrado en classpath.");
                }
                
                if (serviceAccount != null) {
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                } else {
                    log.error("❌ ERROR CRÍTICO: No se encontró el archivo de Firebase. Por favor, configura la variable FIREBASE_CREDENTIALS con el contenido del JSON.");
                    throw new IOException("Archivo de credenciales no disponible.");
                }
            }
            FirebaseApp.initializeApp(options);
        } catch (IOException e) {
            throw new IllegalStateException("No se pudo inicializar Firebase Admin SDK.", e);
        }
    }
}
