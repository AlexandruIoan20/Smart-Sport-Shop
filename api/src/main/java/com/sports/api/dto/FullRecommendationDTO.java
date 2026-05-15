package com.sports.api.dto;

import java.util.List;
import java.util.UUID;

public record FullRecommendationDTO(
        UUID sessionId,
        String                     userLevel,
        String                     createdAt,
        List<RecommendedSportDTO> sports,
        List<RecommendedProductDTO> products
) {}