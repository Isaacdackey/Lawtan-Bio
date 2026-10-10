package com.lawtan.entity;

import com.lawtan.model.BatchStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "transformation_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransformationBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String batchNumber; // e.g. LOT-TR-20260819-01

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "recipe_id", nullable = false)
    private Recipe recipe;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private BatchStatus status;

    @Column(nullable = false)
    private LocalDate productionDate;

    @Column(nullable = false)
    private Double milkLitersConsumed; // Volume de lait prélevé en litres

    @Column(nullable = false)
    private Double expectedQuantity; // Quantité théorique calculée selon le ratio

    private Double actualQuantityProduced; // Quantité réelle mesurée à la fin

    @Column(length = 30)
    private String unit; // ex: pièces, pots, litres, kg

    private Double yieldEfficiencyPercentage; // Rendement réel % (ex: 98.5%)

    private Double wasteLossQuantity; // Pertes constatées (ex: 1.2 kg ou 2 L)

    private LocalDate dlcExpiryDate; // Date Limite de Consommation

    @Column(length = 100)
    private String operatorName; // Nom du maître fromager / fromagère

    @Column(length = 500)
    private String qualityNotes; // Remarques de contrôle qualité et organoleptique

    private Double phLevel; // ex: 4.6

    private Double fatPercentage; // Taux de matière grasse %

    @Column(length = 100)
    private String sourceTank; // ex: "Cuve Réfrigérée N°1 (Bio)"
}
