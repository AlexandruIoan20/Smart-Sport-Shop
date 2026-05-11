package com.sports.api.dto;

import java.util.List;
import java.util.UUID;

public record QuestionnaireResponseDTO(
        UUID sessionId,
        String computedLevel,
        List<RecommendedSportDTO> recommendedSports
) {}