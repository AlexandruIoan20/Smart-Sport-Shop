package com.sports.api.dto;

public record QuestionnaireAnswerDTO(
    String goal,
    String preferredEnvironment,
    String activityLevel,
    String dailySchedule,
    String effortTolerance,
    String prefersTeam,
    Integer freeHoursWeek
) {}