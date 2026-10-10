package com.lawtan.dto;

import lombok.*;

import java.util.List;

public class AuthDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UserProfile {
        private String id;
        private Long numericId;
        private String name;
        private String email;
        private String role;
        private String roleLabel;
        private String roleBadgeColor;
        private String initials;
        private String title;
        private String department;
        private String phone;
        private Boolean active;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthResponse {
        private String token;
        private UserProfile user;
        private Long expiresIn;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CreateUserRequest {
        private String name;
        private String email;
        private String password;
        private String role;
        private String title;
        private String department;
        private String phone;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateUserRequest {
        private String name;
        private String role;
        private String title;
        private String department;
        private String phone;
        private Boolean active;
        private String password; // Optionnel lors de la mise à jour
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateProfileRequest {
        private String name;
        private String phone;
        private String title;
        private String department;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChangePasswordRequest {
        private String email;
        private String oldPassword;
        private String newPassword;
    }
}
