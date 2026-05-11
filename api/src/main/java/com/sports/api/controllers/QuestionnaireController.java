package com.sports.api.controllers;

import com.sports.api.dto.QuestionnaireAnswerDTO;
import com.sports.api.dto.QuestionnaireResponseDTO;
import com.sports.api.services.QuestionnaireService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/questionnaire")
@CrossOrigin(origins = "http://localhost:5173")
public class QuestionnaireController {

private final QuestionnaireService questionnaireService;

public QuestionnaireController(QuestionnaireService questionnaireService) {
    this.questionnaireService = questionnaireService;
}

@PostMapping("/submit")
public ResponseEntity<?> submit(
        @RequestHeader("X-User-Id") UUID userId,
        @RequestBody QuestionnaireAnswerDTO request) {
    try {
        QuestionnaireResponseDTO response = questionnaireService.submit(userId, request);
        return ResponseEntity.ok(response);
    } catch (IllegalArgumentException e) {
        return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
    } catch (RuntimeException e) {
        return ResponseEntity.internalServerError()
                .body(Map.of("error", e.getMessage()));
    }
}
}