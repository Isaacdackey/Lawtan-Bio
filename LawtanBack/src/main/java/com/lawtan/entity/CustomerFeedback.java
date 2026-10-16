package com.lawtan.entity;

import com.lawtan.model.FeedbackCategory;
import com.lawtan.model.FeedbackSource;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;


@Entity
@Table(name = "customer_feedbacks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Optionnel : un avis peut venir d'un client non enregistré (marché, marketplace).
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private Customer customer;

    @Column(length = 120)
    private String customerName; // copie figée du nom au moment de l'avis

    @Column(nullable = false)
    private Integer rating; // 1 à 5

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FeedbackCategory category = FeedbackCategory.OTHER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private FeedbackSource source = FeedbackSource.OTHER;

    @Column(length = 40)
    private String orderReference; // référence de facture / commande concernée (optionnel)

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}