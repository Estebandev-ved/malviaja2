package com.example.malviaja2_backend.controller;

import com.example.malviaja2_backend.model.Producto;
import com.example.malviaja2_backend.service.ProductoService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Controlador de productos. Expone el catálogo públicamente y
 * restringe las operaciones de escritura/borrado solo al rol ADMIN.
 * Seguridad: @PreAuthorize("hasAuthority('ADMIN')") en todas las mutaciones.
 */
@Slf4j
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    /** Catálogo público: cualquier visitante puede ver los productos */
    @GetMapping
    public ResponseEntity<List<Producto>> listarTodos() {
        return ResponseEntity.ok(productoService.obtenerTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtenerProducto(@PathVariable Long id) {
        return productoService.buscarPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /** Crear nuevo producto — solo ADMIN */
    @PostMapping
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Producto> crearProducto(@RequestBody Producto producto) {
        log.info("Admin creando producto: {}", producto.getNombre());
        return ResponseEntity.ok(productoService.guardarProducto(producto));
    }

    /**
     * Actualizar producto existente — solo ADMIN.
     * Retorna 404 si el ID no existe para evitar crear registros fantasma.
     * IMPORTANTE: Copia campos sobre la entidad manejada (con @Version) para evitar
     * "Detached entity with uninitialized version value" de Hibernate.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> actualizarProducto(@PathVariable Long id, @RequestBody Producto cambios) {
        return productoService.buscarPorId(id)
                .map(existente -> {
                    if (existente.getVersion() == null) {
                        productoService.inicializarVersion(id);
                        existente.setVersion(0L);
                    }
                    existente.setNombre(cambios.getNombre());
                    existente.setDescripcion(cambios.getDescripcion());
                    existente.setPrecio(cambios.getPrecio());
                    existente.setDosis(cambios.getDosis());
                    existente.setStock(cambios.getStock());
                    existente.setImageUrl(cambios.getImageUrl());
                    log.info("Admin actualizando producto #{}: {}", id, existente.getNombre());
                    return ResponseEntity.ok(productoService.guardarProducto(existente));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Eliminar producto — solo ADMIN.
     * Retorna 404 si el ID no existe para dar feedback claro al frontend.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<?> eliminarProducto(@PathVariable Long id) {
        if (productoService.buscarPorId(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        log.info("Admin eliminando producto #{}", id);
        productoService.eliminar(id);
        return ResponseEntity.ok(Map.of("mensaje", "Producto eliminado correctamente."));
    }
}
