package com.lawtan.controller;

import com.lawtan.dto.AuthDTO;
import com.lawtan.entity.AppUser;
import com.lawtan.model.RoleName;
import com.lawtan.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private static final int MIN_PASSWORD_LENGTH = 8;

    private final AppUserRepository appUserRepository;
    private final PasswordEncoder passwordEncoder;

    // 1. Liste de tous les utilisateurs
    @GetMapping
    public ResponseEntity<List<AuthDTO.UserProfile>> getAllUsers() {
        List<AuthDTO.UserProfile> users = appUserRepository.findAll().stream()
                .map(this::toProfile)
                .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }

    // 2. Détail d'un utilisateur par ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        return appUserRepository.findById(id)
                .<ResponseEntity<?>>map(user -> ResponseEntity.ok(toProfile(user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of("message", "Utilisateur introuvable.")));
    }

    // 3. Création d'un nouvel utilisateur
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody AuthDTO.CreateUserRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return badRequest("L'adresse email est obligatoire.");
        }
        if (request.getName() == null || request.getName().isBlank()) {
            return badRequest("Le nom complet est obligatoire.");
        }
        String passwordError = validatePassword(request.getPassword());
        if (passwordError != null) {
            return badRequest(passwordError);
        }

        String email = request.getEmail().trim().toLowerCase();
        if (appUserRepository.findByEmailIgnoreCase(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Un compte existe déjà avec cette adresse email (" + email + ")."));
        }

        String requestedRole = (request.getRole() != null && !request.getRole().isBlank())
                ? request.getRole() : RoleName.TECHNICIAN.getCode();
        Optional<RoleName> roleOpt = RoleName.fromCode(requestedRole);
        if (roleOpt.isEmpty()) {
            return badRequest(unknownRoleMessage());
        }
        RoleName role = roleOpt.get();

        AppUser newUser = AppUser.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword().trim()))
                .role(role.getCode())
                .roleLabel(role.getLabel())
                .roleBadgeColor(role.getBadgeColor())
                .initials(computeInitials(request.getName()))
                .title(request.getTitle() != null ? request.getTitle().trim() : role.getLabel())
                .department(request.getDepartment() != null ? request.getDepartment().trim() : role.getDefaultDepartment())
                .phone(request.getPhone() != null ? request.getPhone().trim() : "")
                .active(true)
                .build();

        AppUser saved = appUserRepository.save(newUser);
        log.info("Nouvel utilisateur créé : {} ({})", saved.getEmail(), saved.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(toProfile(saved));
    }

    // 4. Mise à jour des informations d'un utilisateur
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id,
                                        @RequestBody AuthDTO.UpdateUserRequest request,
                                        Authentication authentication) {
        Optional<AppUser> userOpt = appUserRepository.findById(id);
        if (userOpt.isEmpty()) {
            return notFound();
        }

        AppUser user = userOpt.get();
        boolean isSelf = isCurrentUser(user, authentication);

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
            user.setInitials(computeInitials(request.getName()));
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            Optional<RoleName> roleOpt = RoleName.fromCode(request.getRole());
            if (roleOpt.isEmpty()) {
                return badRequest(unknownRoleMessage());
            }
            RoleName role = roleOpt.get();
            // Évite qu'un manager se retire lui-même ses droits (verrouillage de l'administration).
            if (isSelf && role != RoleName.MANAGER) {
                return badRequest("Vous ne pouvez pas modifier votre propre rôle.");
            }
            user.setRole(role.getCode());
            user.setRoleLabel(role.getLabel());
            user.setRoleBadgeColor(role.getBadgeColor());
        }
        if (request.getTitle() != null) user.setTitle(request.getTitle().trim());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getActive() != null) {
            if (isSelf && !request.getActive()) {
                return badRequest("Vous ne pouvez pas désactiver votre propre compte.");
            }
            user.setActive(request.getActive());
        }
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            String passwordError = validatePassword(request.getPassword());
            if (passwordError != null) {
                return badRequest(passwordError);
            }
            user.setPassword(passwordEncoder.encode(request.getPassword().trim()));
        }

        AppUser updated = appUserRepository.save(user);
        log.info("Utilisateur mis à jour : {} ({})", updated.getEmail(), updated.getRole());
        return ResponseEntity.ok(toProfile(updated));
    }

    // 5. Bascule du statut actif / inactif
    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleUserActive(@PathVariable Long id, Authentication authentication) {
        Optional<AppUser> userOpt = appUserRepository.findById(id);
        if (userOpt.isEmpty()) {
            return notFound();
        }

        AppUser user = userOpt.get();
        if (isCurrentUser(user, authentication) && Boolean.TRUE.equals(user.getActive())) {
            return badRequest("Vous ne pouvez pas désactiver votre propre compte.");
        }
        user.setActive(!Boolean.TRUE.equals(user.getActive()));
        AppUser updated = appUserRepository.save(user);
        log.info("Statut utilisateur {} basculé vers : {}", updated.getEmail(), updated.getActive());
        return ResponseEntity.ok(toProfile(updated));
    }

    // 6. Mise à jour du profil personnel (utilisateur connecté, identité issue du JWT)
    @PutMapping("/me/profile")
    public ResponseEntity<?> updateMyProfile(Authentication authentication,
                                             @RequestBody AuthDTO.UpdateProfileRequest request) {
        Optional<AppUser> userOpt = appUserRepository.findByEmailIgnoreCase(authentication.getName());
        if (userOpt.isEmpty()) {
            return notFound();
        }

        AppUser user = userOpt.get();
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
            user.setInitials(computeInitials(request.getName()));
        }
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getTitle() != null) user.setTitle(request.getTitle().trim());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment().trim());

        return ResponseEntity.ok(toProfile(appUserRepository.save(user)));
    }

    // 7. Changement de mot de passe personnel (utilisateur connecté, identité issue du JWT)
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(Authentication authentication,
                                            @RequestBody AuthDTO.ChangePasswordRequest request) {
        String passwordError = validatePassword(request.getNewPassword());
        if (passwordError != null) {
            return badRequest(passwordError);
        }

        Optional<AppUser> userOpt = appUserRepository.findByEmailIgnoreCase(authentication.getName());
        if (userOpt.isEmpty()) {
            return notFound();
        }

        AppUser user = userOpt.get();
        String oldPassword = request.getOldPassword() != null ? request.getOldPassword().trim() : "";
        if (!matchesStoredPassword(user.getPassword(), oldPassword)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "L'ancien mot de passe saisi est incorrect."));
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        appUserRepository.save(user);
        log.info("Mot de passe mis à jour pour l'utilisateur : {}", user.getEmail());
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès."));
    }

    // --- Helpers ---

    private boolean matchesStoredPassword(String stored, String raw) {
        if (stored == null || raw.isEmpty()) return false;
        if (stored.startsWith("$2")) {
            return passwordEncoder.matches(raw, stored);
        }
        // Ancien stockage en clair (comptes pas encore migrés par une connexion)
        return MessageDigest.isEqual(stored.getBytes(StandardCharsets.UTF_8), raw.getBytes(StandardCharsets.UTF_8));
    }

    private String validatePassword(String password) {
        if (password == null || password.isBlank()) {
            return "Le mot de passe est obligatoire.";
        }
        if (password.trim().length() < MIN_PASSWORD_LENGTH) {
            return "Le mot de passe doit comporter au moins " + MIN_PASSWORD_LENGTH + " caractères.";
        }
        return null;
    }

    private boolean isCurrentUser(AppUser user, Authentication authentication) {
        return authentication != null && user.getEmail() != null
                && user.getEmail().equalsIgnoreCase(authentication.getName());
    }

    private String unknownRoleMessage() {
        String codes = Arrays.stream(RoleName.values()).map(RoleName::getCode).collect(Collectors.joining(", "));
        return "Rôle inconnu. Valeurs autorisées : " + codes + ".";
    }

    private ResponseEntity<Map<String, String>> badRequest(String message) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", message));
    }

    private ResponseEntity<Map<String, String>> notFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Utilisateur introuvable."));
    }

    private AuthDTO.UserProfile toProfile(AppUser u) {
        return AuthDTO.UserProfile.builder()
                .id("usr_" + u.getId())
                .numericId(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .role(u.getRole())
                .roleLabel(u.getRoleLabel())
                .roleBadgeColor(u.getRoleBadgeColor())
                .initials(u.getInitials())
                .title(u.getTitle())
                .department(u.getDepartment())
                .phone(u.getPhone())
                .active(Boolean.TRUE.equals(u.getActive()))
                .build();
    }

    private String computeInitials(String fullName) {
        if (fullName == null || fullName.isBlank()) return "LW";
        String[] parts = fullName.trim().split("\\s+");
        if (parts.length == 1) {
            return parts[0].substring(0, Math.min(2, parts[0].length())).toUpperCase();
        }
        return ("" + parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    }
}