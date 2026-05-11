package com.sports.api.controllers;

import com.sports.api.dto.ProfileRequestDTO;
import com.sports.api.services.ProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @PostMapping("/complete")
    public ResponseEntity<?> completeProfile(
            @RequestHeader("X-User-Id") UUID userId,
            @RequestBody ProfileRequestDTO request) {
        try {
            profileService.completeUserProfile(userId, request);
            return ResponseEntity.ok(Map.of("message", "Profil finalizat cu succes!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}