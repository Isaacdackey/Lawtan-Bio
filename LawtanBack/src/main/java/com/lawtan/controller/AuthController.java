package com.lawtan.controller;

import com.lawtan.dto.AuthDTO;
import com.lawtan.entity.AppUser;
import com.lawtan.repository.AppUserRepository;
import com.lawtan.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private static final Pattern BCRYPT_HASH = Pattern.compile("^\\$2[aby]?\\$\\d{2}\\$.{53}$");
    private static final String INVALID_CREDENTIALS = "Identifiant ou mot de passe incorrect.";

    private final AppUserRepository appUserRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthDTO.LoginRequest request) {
        if (request.getUsername() == null || request.getUsername().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "L'identifiant est obligatoire"));
        }

        String username = request.getUsername().trim().toLowerCase();
        String password = request.getPassword() != null ? request.getPassword().trim() : "";

        // CORRECTIF : plus de recherche par rôle/nom ni de mots de passe de démonstration
        // (<rôle>2026, lawtan2026, comparaison insensible à la casse). Seul l'email identifie un compte.
        Optional<AppUser> userOpt = appUserRepository.findByEmailIgnoreCase(username);

        // Même réponse pour "compte inconnu" et "mauvais mot de passe" : pas d'énumération de comptes.
        if (userOpt.isEmpty() || password.isEmpty() || !verifyAndUpgradePassword(userOpt.get(), password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", INVALID_CREDENTIALS));
        }

        AppUser user = userOpt.get();
        if (!Boolean.TRUE.equals(user.getActive())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", "Compte désactivé. Contactez l'administrateur."));
        }

        // CORRECTIF : vrai JWT signé (avant : chaîne "jwt_<rôle>_<uuid>" jamais vérifiée côté serveur).
        String token = jwtService.generateToken(user);

        AuthDTO.UserProfile profile = AuthDTO.UserProfile.builder()
                .id("usr_" + user.getId())
                .numericId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .roleLabel(user.getRoleLabel())
                .roleBadgeColor(user.getRoleBadgeColor())
                .initials(user.getInitials())
                .title(user.getTitle())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .active(true)
                .build();

        return ResponseEntity.ok(AuthDTO.AuthResponse.builder()
                .token(token)
                .user(profile)
                .expiresIn(jwtService.getExpirationSeconds())
                .build());
    }

    /**
     * Vérifie le mot de passe. Les comptes existants ont un mot de passe en clair (ancien stockage) :
     * à la première connexion réussie il est remplacé par son hash BCrypt (migration transparente).
     */
    private boolean verifyAndUpgradePassword(AppUser user, String rawPassword) {
        String stored = user.getPassword();
        if (stored == null || stored.isEmpty()) {
            return false;
        }
        if (BCRYPT_HASH.matcher(stored).matches()) {
            return passwordEncoder.matches(rawPassword, stored);
        }
        boolean legacyMatch = MessageDigest.isEqual(
                stored.getBytes(StandardCharsets.UTF_8),
                rawPassword.getBytes(StandardCharsets.UTF_8));
        if (legacyMatch) {
            user.setPassword(passwordEncoder.encode(rawPassword));
            appUserRepository.save(user);
        }
        return legacyMatch;
    }
}