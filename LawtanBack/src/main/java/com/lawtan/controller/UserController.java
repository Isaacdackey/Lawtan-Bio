package com.lawtan.controller;

import com.lawtan.dto.AuthDTO;
import com.lawtan.entity.AppUser;
import com.lawtan.repository.AppUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
@Slf4j
public class UserController {

    private final AppUserRepository appUserRepository;

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
                .map(user -> ResponseEntity.ok(toProfile(user)))
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body((AuthDTO.UserProfile) null));
    }

    // 3. Création d'un nouvel utilisateur
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody AuthDTO.CreateUserRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "L'adresse email est obligatoire."));
        }
        if (request.getName() == null || request.getName().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Le nom complet est obligatoire."));
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Le mot de passe initial est obligatoire."));
        }

        String email = request.getEmail().trim().toLowerCase();
        if (appUserRepository.findByEmailIgnoreCase(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", "Un compte existe déjà avec cette adresse email (" + email + ")."));
        }

        String role = (request.getRole() != null && !request.getRole().isBlank()) ? request.getRole().toLowerCase().trim() : "tech";
        String roleLabel = resolveRoleLabel(role);
        String roleBadgeColor = resolveRoleBadgeColor(role);
        String initials = computeInitials(request.getName());

        AppUser newUser = AppUser.builder()
                .name(request.getName().trim())
                .email(email)
                .password(request.getPassword().trim())
                .role(role)
                .roleLabel(roleLabel)
                .roleBadgeColor(roleBadgeColor)
                .initials(initials)
                .title(request.getTitle() != null ? request.getTitle().trim() : roleLabel)
                .department(request.getDepartment() != null ? request.getDepartment().trim() : resolveDefaultDepartment(role))
                .phone(request.getPhone() != null ? request.getPhone().trim() : "")
                .active(true)
                .build();

        AppUser saved = appUserRepository.save(newUser);
        log.info("Nouvel utilisateur créé avec succès : {} ({})", saved.getEmail(), saved.getRole());
        return ResponseEntity.status(HttpStatus.CREATED).body(toProfile(saved));
    }

    // 4. Mise à jour des informations d'un utilisateur
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody AuthDTO.UpdateUserRequest request) {
        Optional<AppUser> userOpt = appUserRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Utilisateur introuvable."));
        }

        AppUser user = userOpt.get();
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
            user.setInitials(computeInitials(request.getName()));
        }
        if (request.getRole() != null && !request.getRole().isBlank()) {
            String role = request.getRole().toLowerCase().trim();
            user.setRole(role);
            user.setRoleLabel(resolveRoleLabel(role));
            user.setRoleBadgeColor(resolveRoleBadgeColor(role));
        }
        if (request.getTitle() != null) user.setTitle(request.getTitle().trim());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment().trim());
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getActive() != null) user.setActive(request.getActive());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(request.getPassword().trim());
        }

        AppUser updated = appUserRepository.save(user);
        log.info("Utilisateur mis à jour : {} ({})", updated.getEmail(), updated.getRole());
        return ResponseEntity.ok(toProfile(updated));
    }

    // 5. Bascule du statut actif / inactif
    @PutMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleUserActive(@PathVariable Long id) {
        Optional<AppUser> userOpt = appUserRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Utilisateur introuvable."));
        }

        AppUser user = userOpt.get();
        user.setActive(!Boolean.TRUE.equals(user.getActive()));
        AppUser updated = appUserRepository.save(user);
        log.info("Statut utilisateur {} basculé vers : {}", updated.getEmail(), updated.getActive());
        return ResponseEntity.ok(toProfile(updated));
    }

    // 6. Mise à jour du profil personnel (utilisateur connecté)
    @PutMapping("/me/profile")
    public ResponseEntity<?> updateMyProfile(@RequestParam String email, @RequestBody AuthDTO.UpdateProfileRequest request) {
        Optional<AppUser> userOpt = appUserRepository.findByEmailIgnoreCase(email.trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Utilisateur introuvable."));
        }

        AppUser user = userOpt.get();
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
            user.setInitials(computeInitials(request.getName()));
        }
        if (request.getPhone() != null) user.setPhone(request.getPhone().trim());
        if (request.getTitle() != null) user.setTitle(request.getTitle().trim());
        if (request.getDepartment() != null) user.setDepartment(request.getDepartment().trim());

        AppUser updated = appUserRepository.save(user);
        return ResponseEntity.ok(toProfile(updated));
    }

    // 7. Changement de mot de passe personnel
    @PutMapping("/me/password")
    public ResponseEntity<?> changePassword(@RequestBody AuthDTO.ChangePasswordRequest request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Email obligatoire."));
        }
        if (request.getNewPassword() == null || request.getNewPassword().length() < 4) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Le nouveau mot de passe doit comporter au moins 4 caractères."));
        }

        Optional<AppUser> userOpt = appUserRepository.findByEmailIgnoreCase(request.getEmail().trim());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Compte introuvable."));
        }

        AppUser user = userOpt.get();
        if (!user.getPassword().equals(request.getOldPassword() != null ? request.getOldPassword().trim() : "")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "L'ancien mot de passe saisi est incorrect."));
        }

        user.setPassword(request.getNewPassword().trim());
        appUserRepository.save(user);
        log.info("Mot de passe mis à jour avec succès pour l'utilisateur : {}", user.getEmail());
        return ResponseEntity.ok(Map.of("message", "Mot de passe modifié avec succès."));
    }

    // --- Helpers Mappage & Métier ---
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

    private String resolveRoleLabel(String role) {
        return switch (role.toLowerCase()) {
            case "manager" -> "Directeur Général";
            case "veto" -> "Vétérinaire Chef";
            case "tech" -> "Technicien Élevage";
            case "compta" -> "Comptable & Ventes";
            case "bouvier" -> "Chef Bouvier";
            default -> "Collaborateur Exploitation";
        };
    }

    private String resolveRoleBadgeColor(String role) {
        return switch (role.toLowerCase()) {
            case "manager" -> "#059669"; // Emerald
            case "veto" -> "#0284c7";    // Sky blue
            case "tech" -> "#d97706";    // Amber
            case "compta" -> "#7c3aed";  // Violet
            case "bouvier" -> "#16a34a"; // Green
            default -> "#475569";        // Slate
        };
    }

    private String resolveDefaultDepartment(String role) {
        return switch (role.toLowerCase()) {
            case "manager" -> "Direction Générale";
            case "veto" -> "Santé & Reproduction";
            case "tech" -> "Production & Laiterie";
            case "compta" -> "Commercial & Finances";
            case "bouvier" -> "Élevage & Énergie";
            default -> "Exploitation";
        };
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
