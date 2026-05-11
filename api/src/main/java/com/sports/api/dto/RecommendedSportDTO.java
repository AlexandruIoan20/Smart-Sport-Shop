package com.sports.api.dto;

import java.util.UUID;

public record RecommendedSportDTO(
    UUID sportId,
    String sportName,
    Double compatibilityScore,
    Integer rank
) {}