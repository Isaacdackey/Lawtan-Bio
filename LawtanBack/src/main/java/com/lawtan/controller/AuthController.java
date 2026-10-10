package com.lawtan.controller;

import com.lawtan.dto.AuthDTO;
import com.lawtan.entity.AppUser;
import com.lawtan.repository.AppUserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AppUserRepository appUserRepository;

    public AuthController(AppUserRepository appUserRepository) {
        this.appUserRepository = appUserRepository;
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "L'identifiant est obligatoire"));
        }

        String username = request.getUsername().trim().toLowerCase();
        String password = request.getPassword() != null ? request.getPassword().trim() : "";

        // Recherche en base par email
        Optional<AppUser> userOpt = appUserRepository.findByEmailIgnoreCase(username);

        // Fallback: recherche par rôle si l'email ne correspond pas
        if (userOpt.isEmpty()) {
            userOpt = appUserRepository.findAll().stream()
                    .filter(u -> u.getRole().equalsIgnoreCase(username) ||
                                 u.getName().toLowerCase().contains(username))
                    .findFirst();
        }

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Identifiant non reconnu. Utilisez votre adresse @lawtan.sn"));
        }

        AppUser user = userOpt.get();

        if (!Boolean.TRUE.equals(user.getActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Compte désactivé. Contactez l'administrateur."));
        }

        // Vérification du mot de passe (mot de passe officiel ou raccourci de démonstration)
        boolean validPassword = password.equals(user.getPassword())
                || password.equalsIgnoreCase(user.getPassword())
                || password.equalsIgnoreCase(user.getRole() + "2026")
                || (user.getRole().equalsIgnoreCase("manager") && password.equalsIgnoreCase("lawtan2026"));
        if (!validPassword) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Mot de passe incorrect"));
        }

        // Génération d'un token simple pour la démo
        String token = "jwt_" + user.getRole() + "_" + UUID.randomUUID().toString().replace("-", "");

        AuthDTO.UserProfile profile = AuthDTO.UserProfile.builder()
                .id("usr_" + user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .roleLabel(user.getRoleLabel())
                .roleBadgeColor(user.getRoleBadgeColor())
                .initials(user.getInitials())
                .title(user.getTitle())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .build();

        AuthDTO.AuthResponse response = AuthDTO.AuthResponse.builder()
                .token(token)
                .user(profile)
                .expiresIn(86400L)
                .build();

        return ResponseEntity.ok(response);
    }
}
