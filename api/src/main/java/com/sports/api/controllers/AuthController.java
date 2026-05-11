package com.sports.api.controllers;

import com.sports.api.dto.RegisterRequestDTO;
import com.sports.api.services.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {
    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register (@RequestBody RegisterRequestDTO request) {
        try {
            var userId = authService.register(request);
            return ResponseEntity.ok(Map.of("userId", userId));
        } catch (RuntimeException e) {
            e.printStackTrace();

            return switch (e.getMessage()) {
                case "EMAIL_DUPLICAT" -> ResponseEntity.badRequest().body(Map.of("error", "Email deja existent"));
                case "USERNAME_DUPLICAT" -> ResponseEntity.badRequest().body(Map.of("error", "Username ocupat"));
                default -> ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
            };
        }
    }
}
