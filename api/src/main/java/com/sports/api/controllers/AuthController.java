package com.sports.api.controllers;

import com.sports.api.dto.LoginRequestDTO;
import com.sports.api.dto.LoginResponseDTO;
import com.sports.api.dto.RegisterRequestDTO;
import com.sports.api.services.AuthService;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO request) {
        try {
            LoginResponseDTO response = authService.login(request);
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            e.printStackTrace();

            return switch (e.getMessage()) {
                case "USER_NOT_FOUND", "INVALID_PASSWORD" ->
                        ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                .body(Map.of("error", "Email sau parolă incorectă"));

                case "USER_INACTIVE" ->
                        ResponseEntity.status(HttpStatus.FORBIDDEN)
                                .body(Map.of("error", "Contul tău a fost dezactivat"));

                default ->
                        ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("error", "A apărut o eroare neașteptată la server"));
            };
        }
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
