package com.example.malviaja2_backend.repository;

import com.example.malviaja2_backend.model.Noticia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoticiaRepository extends JpaRepository<Noticia, Long> {
    List<Noticia> findAllByOrderByFechaDesc();

    List<Noticia> findByActivoTrueOrderByFechaDesc();
}
