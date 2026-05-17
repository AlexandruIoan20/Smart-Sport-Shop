package com.sports.api.dto;

import java.util.UUID;

public record RecommendedProductDTO(
    UUID productId,
    String productName,
    String categoryName,
    String sportName,
    Double price,
    String brand,
    String imageUrl,
    String targetLevel,
    String reason,
    Integer stockQuantity
) {}