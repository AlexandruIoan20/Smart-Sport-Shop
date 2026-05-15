package com.sports.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record CartItemDTO(
        UUID productId,
        String productName,
        String brand,
        String imageUrl,
        Integer quantityInCart,
        BigDecimal unitPrice,
        Integer stockAvailable
) {}