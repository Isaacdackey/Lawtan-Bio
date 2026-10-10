package com.lawtan.dto;

import com.lawtan.model.ProductType;

public class InvoiceItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private ProductType productType;
    private Double quantity;
    private String unit;
    private Double unitPriceFcfa;
    private Double lineTotalFcfa;

    public InvoiceItemDTO() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public ProductType getProductType() { return productType; }
    public void setProductType(ProductType productType) { this.productType = productType; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) { this.quantity = quantity; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Double getUnitPriceFcfa() { return unitPriceFcfa; }
    public void setUnitPriceFcfa(Double unitPriceFcfa) { this.unitPriceFcfa = unitPriceFcfa; }

    public Double getLineTotalFcfa() { return lineTotalFcfa; }
    public void setLineTotalFcfa(Double lineTotalFcfa) { this.lineTotalFcfa = lineTotalFcfa; }
}
