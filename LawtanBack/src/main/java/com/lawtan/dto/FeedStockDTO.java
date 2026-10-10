package com.lawtan.dto;

public class FeedStockDTO {
    private Long id;
    private String name;
    private String category;
    private Double currentStockKg;
    private Double alertThresholdKg;
    private Double unitPricePerKgFcfa;
    private String supplierName;
    private String storageLocation;
    private String notes;
    private Boolean isLowStock;

    public FeedStockDTO() {}

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

    public Boolean getIsLowStock() { return isLowStock; }
    public void setIsLowStock(Boolean isLowStock) { this.isLowStock = isLowStock; }
}
