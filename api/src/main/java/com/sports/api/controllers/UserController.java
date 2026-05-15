package com.sports.api.controllers;

import com.sports.api.dto.PersonalDataResponseDTO;
import com.sports.api.dto.ProfileRequestDTO;
import com.sports.api.dto.ProfileResponseDTO;
import com.sports.api.dto.RegisterRequestDTO;
import com.sports.api.dto.UpdatePersonalDataRequestDTO;
import com.sports.api.services.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UUID> register(@RequestBody RegisterRequestDTO request) {
        UUID userId = userService.register(request);
        return ResponseEntity.ok(userId);
    }

    @PostMapping("/{userId}/profile")
    public ResponseEntity<UUID> completeProfile(
            @PathVariable UUID userId,
            @RequestBody ProfileRequestDTO dto) {

        UUID profileId = userService.completeProfile(userId, dto);
        return ResponseEntity.ok(profileId);
    }

    @GetMapping("/{userId}/profile")
    public ResponseEntity<ProfileResponseDTO> getUserProfile(@PathVariable UUID userId) {
        ProfileResponseDTO profile = userService.getUserProfile(userId);
        if (profile == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{userId}/personal-data")
    public ResponseEntity<PersonalDataResponseDTO> getPersonalData(@PathVariable UUID userId) {
        PersonalDataResponseDTO data = userService.getPersonalData(userId);
        if (data == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(data);
    }

    @PutMapping("/{userId}/personal-data")
    public ResponseEntity<Boolean> updatePersonalData(
            @PathVariable UUID userId,
            @RequestBody UpdatePersonalDataRequestDTO dto) {

        Boolean success = userService.updatePersonalData(userId, dto);

        if (Boolean.FALSE.equals(success)) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(true);
    }
}