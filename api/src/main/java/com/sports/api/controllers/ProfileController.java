package com.sports.api.controllers;

import com.sports.api.dto.ProfileRequestDTO;
import com.sports.api.dto.ProfileResponseDTO;
import com.sports.api.services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {
    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(@RequestHeader("X-User-Id") UUID userId) {
        ProfileResponseDTO profile = profileService.getUserProfile(userId);

        return ResponseEntity.ok(Objects.requireNonNullElseGet(profile, () -> Map.of("exists", false)));

    }

    @PostMapping("/complete")
    public ResponseEntity<?> completeProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody ProfileRequestDTO request) {
        try {
            UUID sessionId = profileService.completeUserProfile(userId, request);
            return ResponseEntity.ok(Map.of(
                    "message",   "Profil salvat cu succes!",
                    "sessionId", sessionId
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", e.getMessage()));
        }
    }
}