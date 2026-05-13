package com.example.malviaja2_backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.Base64;
import java.util.Map;

@Service
public class GeminiOcrService {

    private static final Logger log = LoggerFactory.getLogger(GeminiOcrService.class);

    private static final String PROMPT = """
            Rol: Actúa como un experto en auditoría financiera y OCR especializado en comprobantes de pago de bancos colombianos.

            Tarea: Analiza la imagen del comprobante de transferencia adjunto y extrae la información necesaria para validar un pedido en la tienda \"Malviajado2\".

            Instrucciones Críticas:

            Monto: Extrae el valor total transferido. Elimina símbolos de moneda ($), puntos de miles o comas de decimales. Devuelve solo el número entero (ej. 50000).

            Referencia: Localiza el número de comprobante, ID de transacción o número de aprobación.

            Fecha: Extrae la fecha de la operación en formato YYYY-MM-DD.

            Entidad: Identifica si es Nequi, Bancolombia, Daviplata o PSE.

            Validación de Integridad: Si la imagen no parece un comprobante de pago o está demasiado borrosa para leer el monto, devuelve un error en el campo correspondiente.

            Formato de Salida (Estricto JSON):

            JSON
            {
              \"monto\": 0,
              \"referencia\": \"string\",
              \"fecha\": \"YYYY-MM-DD\",
              \"entidad\": \"string\",
              \"confianza_extraccion\": 0.0 a 1.0
            }
            Nota: No incluyas explicaciones, saludos ni texto adicional. Solo el objeto JSON.
            """;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    private final String apiKey;
    private final String model;
    private final String endpoint;

    public GeminiOcrService(
            ObjectMapper objectMapper,
            @Value("${gemini.api.key:}") String apiKey,
            @Value("${gemini.model:gemini-1.5-flash}") String model) {
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
        this.apiKey = apiKey;
        this.model = model;
        this.endpoint = "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent";
    }

    public OcrExtractionResult extraerComprobante(MultipartFile comprobante) {
        if (apiKey == null || apiKey.isBlank()) {
            log.warn("Gemini API key no configurada");
            return OcrExtractionResult.error("API_KEY_MISSING");
        }

        try {
            String base64 = Base64.getEncoder().encodeToString(comprobante.getBytes());
            String mimeType = comprobante.getContentType() != null ? comprobante.getContentType() : "image/jpeg";

            Map<String, Object> payload = Map.of(
                    "contents", new Object[] {
                            Map.of(
                                    "role", "user",
                                    "parts", new Object[] {
                                            Map.of("text", PROMPT),
                                            Map.of("inline_data", Map.of(
                                                    "mime_type", mimeType,
                                                    "data", base64
                                            ))
                                    }
                            )
                    }
            );

            String body = objectMapper.writeValueAsString(payload);
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint + "?key=" + apiKey))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                log.warn("Gemini OCR fallo: status {} body: {}", response.statusCode(), response.body());
                return OcrExtractionResult.error("GEMINI_ERROR");
            }

            return parseResponse(response.body());
        } catch (Exception e) {
            log.warn("Gemini OCR exception: {}", e.getMessage());
            return OcrExtractionResult.error("GEMINI_EXCEPTION");
        }
    }

    private OcrExtractionResult parseResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode textNode = root.at("/candidates/0/content/parts/0/text");
        if (textNode.isMissingNode()) {
            return OcrExtractionResult.error("NO_TEXT");
        }

        String raw = textNode.asText();
        String cleaned = raw.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("(?s)^```[a-zA-Z]*\\n", "");
            cleaned = cleaned.replaceAll("```$", "");
            cleaned = cleaned.trim();
        }

        JsonNode json = objectMapper.readTree(cleaned);
        OcrExtractionResult result = new OcrExtractionResult();
        result.setRawJson(cleaned);
        result.setRawText(raw);
        if (json.hasNonNull("monto")) {
            result.setMonto(json.get("monto").asLong());
        }
        if (json.hasNonNull("referencia")) {
            result.setReferencia(json.get("referencia").asText());
        }
        if (json.hasNonNull("fecha")) {
            String fecha = json.get("fecha").asText();
            result.setFecha(LocalDate.parse(fecha));
        }
        if (json.hasNonNull("entidad")) {
            result.setEntidad(json.get("entidad").asText());
        }
        if (json.hasNonNull("confianza_extraccion")) {
            result.setConfianzaExtraccion(json.get("confianza_extraccion").asDouble());
        }

        return result;
    }
}
