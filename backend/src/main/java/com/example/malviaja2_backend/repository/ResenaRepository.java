package com.example.malviaja2_backend.repository;

import com.example.malviaja2_backend.model.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {
    List<Resena> findByProductoIdAndActivoTrueOrderByFechaDesc(Long productoId);
    List<Resena> findByUsuarioUidOrderByFechaDesc(String usuarioUid);
    void deleteByProductoId(Long productoId);
}
