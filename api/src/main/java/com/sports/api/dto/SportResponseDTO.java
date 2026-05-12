package com.sports.api.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record SportResponseDTO(
    UUID sportId,
    String name,
    String description,
    boolean isTeamSport,
    boolean isOutdoor,
    int effortLevel,
    BigDecimal minBudget,
    String imageUrl,
    boolean isActive
) {}