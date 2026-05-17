package com.sports.api.dto;

import java.util.UUID;

public record RecommendedSportDTO(
    UUID sportId,
    String sportName,
    String description,
    Double compatibilityScore,
    Integer rank,
    Boolean isTeamSport,
    Boolean isOutdoor,
    Integer effortLevel,
    String  imageUrl
) {}