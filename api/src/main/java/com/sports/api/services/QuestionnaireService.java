package com.sports.api.services;

import com.sports.api.dto.QuestionnaireAnswerDTO;
import com.sports.api.dto.QuestionnaireResponseDTO;
import com.sports.api.dto.RecommendedSportDTO;
import com.sports.api.repositories.QuestionnaireRepository;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class QuestionnaireService {
    private final QuestionnaireRepository questionnaireRepository;

    public QuestionnaireService(QuestionnaireRepository questionnaireRepository) {
        this.questionnaireRepository = questionnaireRepository;
    }

    public QuestionnaireResponseDTO submit(UUID userId, QuestionnaireAnswerDTO dto) {
        validateAnswers(dto);

        String jsonAnswers = buildJson(dto);

        UUID sessionId;
        try {
            sessionId = questionnaireRepository.submitQuestionnaire(userId, jsonAnswers);
        } catch (DataAccessException e) {
            String msg = e.getMostSpecificCause().getMessage();
            if (msg != null && msg.contains("QUESTIONNAIRE_INCOMPLETE")) {
                throw new IllegalArgumentException("QUESTIONNAIRE_INCOMPLETE");
            }
            throw new RuntimeException("QUESTIONNAIRE_ERROR: " + msg);
        }

        String computedLevel = questionnaireRepository.getComputedLevel(sessionId);
        List<RecommendedSportDTO> sports = questionnaireRepository.getRecommendationsBySession(sessionId);

        return new QuestionnaireResponseDTO(sessionId, computedLevel, sports);
    }

    private void validateAnswers(QuestionnaireAnswerDTO dto) {
        List<String> validGoals = List.of(
                "WEIGHT_LOSS", "MUSCLE_GAIN", "CARDIO", "STRESS_RELIEF", "FLEXIBILITY"
        );
        List<String> validEnvironments = List.of("INDOOR", "OUTDOOR", "BOTH");
        List<String> validActivityLevels = List.of(
                "SEDENTARY", "LIGHT", "MODERATE", "ACTIVE", "VERY_ACTIVE"
        );
        List<String> validSchedules = List.of(
                "FULL_TIME", "PART_TIME", "FLEXIBLE", "STUDENT", "RETIRED"
        );
        List<String> validEffort = List.of("LOW", "MEDIUM", "HIGH");

        if (dto.goal() == null || !validGoals.contains(dto.goal()))
            throw new IllegalArgumentException("INVALID_GOAL");

        if (dto.preferredEnvironment() == null || !validEnvironments.contains(dto.preferredEnvironment()))
            throw new IllegalArgumentException("INVALID_ENVIRONMENT");

        if (dto.activityLevel() == null || !validActivityLevels.contains(dto.activityLevel()))
            throw new IllegalArgumentException("INVALID_ACTIVITY_LEVEL");

        if (dto.dailySchedule() == null || !validSchedules.contains(dto.dailySchedule()))
            throw new IllegalArgumentException("INVALID_DAILY_SCHEDULE");

        if (dto.effortTolerance() == null || !validEffort.contains(dto.effortTolerance()))
            throw new IllegalArgumentException("INVALID_EFFORT_TOLERANCE");

        if (dto.freeHoursWeek() == null || dto.freeHoursWeek() < 0 || dto.freeHoursWeek() > 168)
            throw new IllegalArgumentException("INVALID_FREE_HOURS");
    }

    private String buildJson(QuestionnaireAnswerDTO dto) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("goal",                   dto.goal());
        map.put("preferred_environment",  dto.preferredEnvironment());
        map.put("activity_level",         dto.activityLevel());
        map.put("daily_schedule",         dto.dailySchedule());
        map.put("effort_tolerance",       dto.effortTolerance());
        map.put("free_hours_week",        String.valueOf(dto.freeHoursWeek()));

        if (dto.prefersTeam() != null)
            map.put("prefers_team", dto.prefersTeam());

        StringBuilder sb = new StringBuilder("{");
        map.forEach((k, v) ->
                sb.append("\"").append(k).append("\":\"").append(v).append("\",")
        );
        sb.deleteCharAt(sb.length() - 1);
        sb.append("}");
        return sb.toString();
    }
}