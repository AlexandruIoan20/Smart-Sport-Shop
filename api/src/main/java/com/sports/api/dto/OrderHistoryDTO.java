package com.sports.api.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record OrderHistoryDTO(
        UUID orderId,
        String status,
        BigDecimal totalAmount,
        String shippingAddress,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        UUID sessionId,
        long itemCount,
        List<OrderItemDTO> items
) {}