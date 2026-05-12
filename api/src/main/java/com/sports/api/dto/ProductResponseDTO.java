package com.sports.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ProductResponseDTO(
    UUID productId,
    String name,
    String description,
    BigDecimal price,
    String categoryName,
    String sportName,
    String targetLevel,
    String brand,
    String imageUrl,
    Integer stockQuantity,
    LocalDateTime createdAt
) {
}
