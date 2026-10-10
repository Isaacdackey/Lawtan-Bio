package com.lawtan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Tarif de vente du lait cru au litre.
 *
 * Une seule ligne, mise a jour quand le prix change. Les factures deja emises
 * conservent le prix qui leur a ete applique : changer ce tarif n'affecte que
 * les ventes a venir.
 */
@Entity
@Table(name = "milk_pricing")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MilkPricing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Prix de vente du litre de lait cru, en FCFA. */
    private Double directSalePricePerLiterFcfa;

    @Column(length = 255)
    private String notes;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(length = 120)
    private String updatedBy;
}
