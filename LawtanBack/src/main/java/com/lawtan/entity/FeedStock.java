package com.lawtan.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "feed_stocks")
public class FeedStock {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String category; // FORAGE_GREEN, FORAGE_DRY, CONCENTRATE, MINERALS_VITAMINS

    @Column(nullable = false)
    private Double currentStockKg;

    @Column(nullable = false)
    private Double alertThresholdKg;

    private Double unitPricePerKgFcfa;

    private String supplierName;

    private String storageLocation;

    @Column(columnDefinition = "TEXT")
    private String notes;

    public FeedStock() {}

    public FeedStock(String name, String category, Double currentStockKg, Double alertThresholdKg, Double unitPricePerKgFcfa, String supplierName, String storageLocation, String notes) {
        this.name = name;
        this.category = category;
        this.currentStockKg = currentStockKg;
        this.alertThresholdKg = alertThresholdKg;
        this.unitPricePerKgFcfa = unitPricePerKgFcfa;
        this.supplierName = supplierName;
        this.storageLocation = storageLocation;
        this.notes = notes;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Double getCurrentStockKg() { return currentStockKg; }
    public void setCurrentStockKg(Double currentStockKg) { this.currentStockKg = currentStockKg; }

    public Double getAlertThresholdKg() { return alertThresholdKg; }
    public void setAlertThresholdKg(Double alertThresholdKg) { this.alertThresholdKg = alertThresholdKg; }

    public Double getUnitPricePerKgFcfa() { return unitPricePerKgFcfa; }
    public void setUnitPricePerKgFcfa(Double unitPricePerKgFcfa) { this.unitPricePerKgFcfa = unitPricePerKgFcfa; }

    public String getSupplierName() { return supplierName; }
    public void setSupplierName(String supplierName) { this.supplierName = supplierName; }

    public String getStorageLocation() { return storageLocation; }
    public void setStorageLocation(String storageLocation) { this.storageLocation = storageLocation; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
