package com.sports.api.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderCartDTO(
    UUID orderId,
    String orderStatus,
    BigDecimal totalAmount,
    String shippingAddress,
    List<CartItemDTO> items
) {}