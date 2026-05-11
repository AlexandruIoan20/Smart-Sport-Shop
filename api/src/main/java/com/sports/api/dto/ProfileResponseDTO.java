package com.sports.api.dto;

import java.math.BigDecimal;

public record ProfileResponseDTO(
    String occupation,
    String goal,
    String preferredEnvironment,
    String dailySchedule,
    Integer freeHoursWeek,
    String activityLevel,
    BigDecimal budgetMin,
    BigDecimal budgetMax
) {}