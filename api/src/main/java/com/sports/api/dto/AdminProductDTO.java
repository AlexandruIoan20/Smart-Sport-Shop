package com.sports.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record AdminProductDTO(
        UUID          productId,
        String        name,
        String        description,
        BigDecimal price,
        UUID categoryId,
        String        categoryName,
        UUID          sportId,
        String        sportName,
        String        targetLevel,
        String        brand,
        String        imageUrl,
        Boolean       isActive,
        LocalDateTime createdAt,
        Integer       stockQty
) {}
