package com.lawtan.entity;

import com.lawtan.model.ProductType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Recipe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code; // e.g. REC-CHEESE-01

    @Column(nullable = false, length = 100)
    private String name; // e.g. Fromage Frais Bio 200g

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ProductType productType;

    @Column(nullable = false, length = 50)
    private String targetUnit; // e.g. "pièce 200g", "pot 125g", "bouteille 1L"

    @Column(nullable = false)
    private Double milkLitersPerUnit; // e.g. 2.0 L de lait pour 1 pièce de 200g

    @Column(length = 500)
    private String ingredientsList; // e.g. "Ferments lactiques bio, présure naturelle, sel de Saloum"

    private Integer shelfLifeDays; // e.g. 60 jours pour fromage, 21 jours pour yaourt

    @Column(columnDefinition = "TEXT")
    private String processInstructions; // Directives techniques de fabrication

    @Column(length = 20)
    private String emoji; // e.g. 🧀, 🥛, 🧈, 🥣

    private Double standardSellingPriceFcfa; // Prix de vente standard indicatif
}
