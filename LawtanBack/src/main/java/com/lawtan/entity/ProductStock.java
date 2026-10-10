package com.lawtan.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "product_stocks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipe_id")
    private Recipe recipe;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "batch_id")
    private TransformationBatch batch;

    @Column(nullable = false, length = 100)
    private String productName;

    @Column(nullable = false)
    private Double quantityAvailable; // Quantité restante en stock

    @Column(length = 30)
    private String unit; // e.g. pièces, pots, bouteilles

    @Column(nullable = false)
    private Double unitPriceFcfa; // Prix unitaire en FCFA

    private Double totalValueFcfa; // Valeur totale du stock

    private LocalDate mfgDate; // Date de fabrication

    private LocalDate dlcExpiryDate; // Date Limite de Consommation

    @Column(length = 100)
    private String storageLocation; // ex: "Chambre Froide Fromagerie (+4°C)"

    @Builder.Default
    private Boolean isOrganicCertified = true;
}
