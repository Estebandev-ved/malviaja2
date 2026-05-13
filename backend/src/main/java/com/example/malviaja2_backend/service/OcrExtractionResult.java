package com.example.malviaja2_backend.service;

import java.time.LocalDate;

public class OcrExtractionResult {
    private Long monto;
    private String referencia;
    private LocalDate fecha;
    private String entidad;
    private Double confianzaExtraccion;
    private String error;
    private String rawJson;
    private String rawText;

    public static OcrExtractionResult error(String mensaje) {
        OcrExtractionResult result = new OcrExtractionResult();
        result.error = mensaje;
        result.confianzaExtraccion = 0.0;
        return result;
    }

    public Long getMonto() {
        return monto;
    }

    public void setMonto(Long monto) {
        this.monto = monto;
    }

    public String getReferencia() {
        return referencia;
    }

    public void setReferencia(String referencia) {
        this.referencia = referencia;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public void setFecha(LocalDate fecha) {
        this.fecha = fecha;
    }

    public String getEntidad() {
        return entidad;
    }

    public void setEntidad(String entidad) {
        this.entidad = entidad;
    }

    public Double getConfianzaExtraccion() {
        return confianzaExtraccion;
    }

    public void setConfianzaExtraccion(Double confianzaExtraccion) {
        this.confianzaExtraccion = confianzaExtraccion;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getRawJson() {
        return rawJson;
    }

    public void setRawJson(String rawJson) {
        this.rawJson = rawJson;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    public boolean isComplete() {
        return monto != null && monto > 0
                && referencia != null && !referencia.isBlank()
                && fecha != null
                && entidad != null && !entidad.isBlank();
    }
}
