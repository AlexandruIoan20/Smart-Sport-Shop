package com.sports.api.services;

import com.sports.api.dto.*;
import com.sports.api.repositories.AdminRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class AdminService {
    private final AdminRepository adminRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public List<CategoryDTO> getAllCategories() {
        return adminRepository.getAllCategories();
    }

    public List<AdminProductDTO> getAllProducts() {
        return adminRepository.getAllProducts();
    }

    public UUID createProduct(CreateProductRequestDTO dto) {
        return adminRepository.createProduct(dto);
    }

    public Boolean updateProduct(UUID productId, UpdateProductRequestDTO dto) {
        return adminRepository.updateProduct(productId, dto);
    }

    public Boolean deleteProduct(UUID productId) {
        return adminRepository.deleteProduct(productId);
    }

    public Boolean updateStock(UUID productId, UpdateStockRequestDTO dto) {
        if (dto.quantity() == null || dto.quantity() < 0) {
            throw new IllegalArgumentException("Cantitatea trebuie să fie >= 0.");
        }
        return adminRepository.updateStock(productId, dto.quantity());
    }
}
