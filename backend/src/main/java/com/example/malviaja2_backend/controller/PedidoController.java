package com.example.malviaja2_backend.controller;

import com.example.malviaja2_backend.model.Pedido;
import com.example.malviaja2_backend.model.PedidoRequest;
import com.example.malviaja2_backend.model.Usuario;
import com.example.malviaja2_backend.repository.UsuarioRepository;
import com.example.malviaja2_backend.service.PedidoService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    @GetMapping("/referencia/{ref}")
    public ResponseEntity<?> obtenerPorReferencia(@PathVariable String ref) {
        org.springframework.security.core.Authentication auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        
        return pedidoService.obtenerPorReferencia(ref)
                .<ResponseEntity<?>>map(pedido -> {
                    boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ADMIN"));
                    if (!isAdmin && !auth.getName().equals(pedido.getUsuario().getFirebaseUid())) {
                        return ResponseEntity.status(403).body(Map.of("error", "No tienes permiso para ver este pedido."));
                    }
                    return ResponseEntity.ok(pedido);
                })
                .orElse(ResponseEntity.notFound().build());
    }



    private final PedidoService pedidoService;
    private final UsuarioRepository usuarioRepository;
    private static final Logger log = LoggerFactory.getLogger(PedidoController.class);

    public PedidoController(PedidoService pedidoService, UsuarioRepository usuarioRepository) {
        this.pedidoService = pedidoService;
        this.usuarioRepository = usuarioRepository;
    }

    @GetMapping("/usuario/{firebaseUid}")
    @PreAuthorize("authentication.name == #firebaseUid or hasAuthority('ADMIN')")
    public ResponseEntity<List<Pedido>> obtenerHistorial(@PathVariable String firebaseUid) {
        return ResponseEntity.ok(pedidoService.obtenerHistorial(firebaseUid));
    }

    @GetMapping("/todos")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Page<Pedido>> obtenerTodos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(page, Math.min(size, 100),
                Sort.by(Sort.Direction.DESC, "fechaPedido"));
        return ResponseEntity.ok(pedidoService.obtenerTodos(pageable));
    }

    @GetMapping("/usuarios/todos")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Usuario>> obtenerUsuarios() {
        return ResponseEntity.ok(usuarioRepository.findAll());
    }

    @PutMapping("/usuarios/{id}/rol")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> cambiarRol(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String nuevoRol = body.get("rol");
        if (nuevoRol == null || (!nuevoRol.equals("ADMIN") && !nuevoRol.equals("USER"))) {
            return ResponseEntity.badRequest().body(Map.of("error", "Rol inválido. Solo se permite ADMIN o USER."));
        }

        Optional<Usuario> usuarioOpt = usuarioRepository.findById(id);
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Usuario usuario = usuarioOpt.get();
        usuario.setRol(nuevoRol);
        usuarioRepository.save(usuario);
        log.info("Rol de usuario #{} cambiado a: {}", id, nuevoRol);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/usuario/{firebaseUid}/perfil")
    @PreAuthorize("authentication.name == #firebaseUid or hasAuthority('ADMIN')")
    public ResponseEntity<?> obtenerPerfil(@PathVariable String firebaseUid) {
        return usuarioRepository.findByFirebaseUid(firebaseUid)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> actualizarEstado(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String estado = body.get("estado");
        String motivo = body.get("motivo");
        try {
            return pedidoService.actualizarEstado(id, estado, motivo)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping(value = "/checkout", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> procesarCheckout(
            @Valid @ModelAttribute PedidoRequest request,
            @RequestParam("comprobante") MultipartFile comprobante) {

        String authUid = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        if (!authUid.equals(request.getUserId())) {
            log.warn("Intento de BOLA detectado: Usuario {} intentó crear un pedido para {}", authUid, request.getUserId());
            return ResponseEntity.status(403).body(Map.of("error", "No tienes permiso para crear pedidos a nombre de otro usuario."));
        }

        log.info("Recibiendo pedido de: {} ({})", request.getNombre(), request.getEmail());
        try {
            Pedido pedido = pedidoService.procesarCheckout(request, comprobante);
            return ResponseEntity.ok(Map.of(
                    "mensaje", "Pedido procesado con éxito.",
                    "pedidoId", pedido.getId(),
                    "referencia", pedido.getReferencia() != null ? pedido.getReferencia() : ""
            ));
        } catch (IllegalStateException e) {
            // Error de negocio controlado (ej: stock insuficiente) → 409 Conflict
            log.warn("Pedido rechazado por regla de negocio: {}", e.getMessage());
            return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error inesperado al procesar el pedido", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Error procesando el pedido. Por favor intenta de nuevo."));
        }
    }
}
