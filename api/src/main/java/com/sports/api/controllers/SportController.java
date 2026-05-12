package com.sports.api.controllers;

import com.sports.api.dto.SportResponseDTO;
import com.sports.api.services.SportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sports")
@CrossOrigin(origins = "*")
public class SportController {

    private final SportService sportService;

    public SportController(SportService sportService) {
        this.sportService = sportService;
    }

    @GetMapping
    public ResponseEntity<List<SportResponseDTO>> getAllSports() {
        List<SportResponseDTO> sports = sportService.getAllSports();
        return ResponseEntity.ok(sports);
    }
}