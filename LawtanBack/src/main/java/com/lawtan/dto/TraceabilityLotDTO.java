package com.lawtan.dto;

import lombok.*;

/**
 * Passeport de traçabilité d'un lot, reconstitué depuis un ordre de fabrication réel
 * (TransformationBatch) et sa recette. Rien n'est ajouté qui ne soit pas en base.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TraceabilityLotDTO {

    private Long batchId;
    private String lotNumber;            // ex: LOT-TR-20260916-01
    private String productName;          // Nom de la recette
    private String productType;          // CHEESE, YOGURT, ...
    private String productionDate;       // ISO yyyy-MM-dd
    private String dlcExpiryDate;        // ISO yyyy-MM-dd

    private Double milkLitersConsumed;   // Lait cru engagé dans le lot
    private Double quantityProduced;     // Quantité réellement obtenue
    private String unit;                 // pièces, pots, litres, kg
    private Double yieldEfficiencyPercentage;
    private Double wasteLossQuantity;

    private Double phLevel;              // Mesure qualité réelle (null si non saisie)
    private Double fatPercentage;
    private String sourceTank;
    private String operatorName;
    private String qualityNotes;

    private String status;               // PLANNED, IN_PROGRESS, COMPLETED, CANCELLED
    private String qualityStatus;        // Libellé lisible dérivé du statut et de la DLC
    private Integer daysRemainingDlc;    // null si pas de DLC saisie
    private Boolean organicCertified;    // Depuis le stock produit rattaché, si présent
}
