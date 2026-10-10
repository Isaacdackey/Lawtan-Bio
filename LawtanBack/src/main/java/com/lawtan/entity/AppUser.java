package com.lawtan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "app_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password; // Stockage en clair pour la démo

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false, length = 30)
    private String role; // manager, veto, tech, compta, bouvier

    @Column(nullable = false, length = 80)
    private String roleLabel;

    @Column(nullable = false, length = 9)
    private String roleBadgeColor; // hex color

    @Column(nullable = false, length = 10)
    private String initials;

    @Column(nullable = false, length = 120)
    private String title;

    @Column(nullable = false, length = 80)
    private String department;

    @Column(length = 30)
    private String phone;

    @Builder.Default
    private Boolean active = true;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
