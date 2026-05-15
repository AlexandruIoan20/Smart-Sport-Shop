package com.sports.api.controllers;

import com.sports.api.dto.*;
import com.sports.api.services.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(adminService.getAllCategories());
    }

    @GetMapping("/products")
    public ResponseEntity<List<AdminProductDTO>> getAllProducts() {
        return ResponseEntity.ok(adminService.getAllProducts());
    }

    @PostMapping("/products")
    public ResponseEntity<UUID> createProduct(@RequestBody CreateProductRequestDTO dto) {
        UUID productId = adminService.createProduct(dto);
        return ResponseEntity.ok(productId);
    }

    @PutMapping("/products/{productId}")
    public ResponseEntity<Boolean> updateProduct(
            @PathVariable UUID productId,
            @RequestBody UpdateProductRequestDTO dto) {

        Boolean success = adminService.updateProduct(productId, dto);
        if (Boolean.FALSE.equals(success)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(true);
    }

    @DeleteMapping("/products/{productId}")
    public ResponseEntity<Boolean> deleteProduct(@PathVariable UUID productId) {
        Boolean success = adminService.deleteProduct(productId);
        if (Boolean.FALSE.equals(success)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(true);
    }

    @PatchMapping("/products/{productId}/stock")
    public ResponseEntity<Boolean> updateStock(
            @PathVariable UUID productId,
            @RequestBody UpdateStockRequestDTO dto) {

        Boolean success = adminService.updateStock(productId, dto);
        return ResponseEntity.ok(success);
    }
}