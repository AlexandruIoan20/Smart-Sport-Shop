package com.sports.api.dto;

import java.math.BigDecimal;

public record ProfileRequestDTO(
    String occupation,
    String goal,
    String preferredEnvironment,
    String dailySchedule,
    Integer freeHoursWeek,
    String activityLevel,
    String effortTolerance,
    Boolean prefersTeam,
    String medicalNotes,
    Double budgetMin,
    Double budgetMax
) {}