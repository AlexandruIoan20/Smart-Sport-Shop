package com.sports.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record UpdateProductRequestDTO(
    String name,
    String description,
    BigDecimal price,
    UUID categoryId,
    UUID sportId,
    String targetLevel,
    String brand,
    String imageUrl,
    Boolean isActive
) {}