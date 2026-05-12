package com.sports.api.controllers;

import com.sports.api.dto.CategoryResponseDTO;
import com.sports.api.dto.ProductResponseDTO;
import com.sports.api.services.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ProductController {
    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CategoryResponseDTO>> getAllCategories() {
        List<CategoryResponseDTO> categories = productService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/products/category/{categoryId}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByCategory(@PathVariable UUID categoryId) {
        List<ProductResponseDTO> products = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/sport/{sportId}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsBySport(@PathVariable UUID sportId) {
        List<ProductResponseDTO> products = productService.getProductsBySport(sportId);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/{productId}")
    public ResponseEntity<ProductResponseDTO> getProductById(@PathVariable UUID productId) {
        ProductResponseDTO product = productService.getProductById(productId);
        return ResponseEntity.ok(product);
    }

    @GetMapping("/products/search")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByName(@RequestParam String name) {
        List<ProductResponseDTO> products = productService.getProductsByName(name);
        return ResponseEntity.ok(products);
    }

    @GetMapping("/products/brand/{brandName}")
    public ResponseEntity<List<ProductResponseDTO>> getProductsByBrand(@PathVariable String brandName) {
        List<ProductResponseDTO> products = productService.getProductsByBrand(brandName);
        return ResponseEntity.ok(products);
    }
}