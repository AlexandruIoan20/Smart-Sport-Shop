package com.sports.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemDTO(
        UUID productId,
        String productName,
        int quantity,
        BigDecimal unitPrice,
        String imageUrl
) {}