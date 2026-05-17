package com.sports.api.dto;

public record ProfileResponseDTO(
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