package com.example.malviaja2_backend.service;

import com.example.malviaja2_backend.model.Resena;
import com.example.malviaja2_backend.repository.ResenaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResenaService {

    private final ResenaRepository resenaRepository;

    public List<Resena> obtenerPorProducto(Long productoId) {
        return resenaRepository.findByProductoIdAndActivoTrueOrderByFechaDesc(productoId);
    }

    public Map<String, Object> obtenerResumen(Long productoId) {
        List<Resena> resenas = obtenerPorProducto(productoId);
        double promedio = resenas.stream()
                .mapToInt(Resena::getCalificacion)
                .average()
                .orElse(0.0);
        return Map.of(
                "total", resenas.size(),
                "promedio", Math.round(promedio * 10) / 10.0
        );
    }

    public Resena crearResena(Resena resena) {
        if (resena.getCalificacion() < 1 || resena.getCalificacion() > 5) {
            throw new IllegalArgumentException("Calificación debe ser entre 1 y 5");
        }
        log.info("Nueva reseña para producto #{} de usuario {}", resena.getProductoId(), resena.getUsuarioUid());
        return resenaRepository.save(resena);
    }

    public Optional<Resena> buscarPorId(Long id) {
        return resenaRepository.findById(id);
    }

    public void eliminar(Long id) {
        resenaRepository.deleteById(id);
        log.info("Reseña #{} eliminada", id);
    }

    public List<Resena> obtenerPorUsuario(String usuarioUid) {
        return resenaRepository.findByUsuarioUidOrderByFechaDesc(usuarioUid);
    }
}
