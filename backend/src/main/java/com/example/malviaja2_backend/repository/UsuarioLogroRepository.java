package com.example.malviaja2_backend.repository;

import com.example.malviaja2_backend.model.UsuarioLogro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioLogroRepository extends JpaRepository<UsuarioLogro, Long> {
    List<UsuarioLogro> findByUsuarioUidOrderByFechaObtenidoDesc(String usuarioUid);
    Optional<UsuarioLogro> findByUsuarioUidAndLogroId(String usuarioUid, Long logroId);
    boolean existsByUsuarioUidAndLogroId(String usuarioUid, Long logroId);
}
