package com.sports.api.services;

import com.sports.api.dto.CategoryResponseDTO;
import com.sports.api.dto.ProductResponseDTO;
import com.sports.api.repositories.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<CategoryResponseDTO> getAllCategories() {
        return productRepository.getAllCategories();
    }

    public List<ProductResponseDTO> getProductsByCategory(UUID categoryId) {
        return productRepository.getProductsByCategory(categoryId);
    }

    public List<ProductResponseDTO> getProductsByName(String name) {
        return productRepository.getProductsByName(name);
    }

    public ProductResponseDTO getProductById(UUID productId) {
        ProductResponseDTO product = productRepository.getProductById(productId);
        if (product == null) {
            throw new RuntimeException("Produsul cu ID-ul " + productId + " nu a fost găsit.");
        }
        return product;
    }

    public List<ProductResponseDTO> getProductsBySport(UUID sportId) {
        return productRepository.getProductsBySport(sportId);
    }

    public List<ProductResponseDTO> getProductsByBrand(String brand) {
        return productRepository.getProductsByBrand(brand);
    }
}