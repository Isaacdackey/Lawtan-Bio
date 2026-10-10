package com.lawtan.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lawtan.model.ProductType;
import jakarta.persistence.*;

@Entity
@Table(name = "invoice_items")
public class InvoiceItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    @JsonIgnore
    private SaleInvoice invoice;

    private Long productId;

    @Column(nullable = false)
    private String productName;

    @Enumerated(EnumType.STRING)
    private ProductType productType;

    @Column(nullable = false)
    private Double quantity;

    private String unit;

    @Column(nullable = false)
    private Double unitPriceFcfa;

    @Column(nullable = false)
    private Double lineTotalFcfa;

    public InvoiceItem() {}

    public InvoiceItem(SaleInvoice invoice, Long productId, String productName, ProductType productType, Double quantity, String unit, Double unitPriceFcfa) {
        this.invoice = invoice;
        this.productId = productId;
        this.productName = productName;
        this.productType = productType;
        this.quantity = quantity;
        this.unit = unit;
        this.unitPriceFcfa = unitPriceFcfa;
        this.lineTotalFcfa = (quantity != null && unitPriceFcfa != null) ? quantity * unitPriceFcfa : 0.0;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SaleInvoice getInvoice() { return invoice; }
    public void setInvoice(SaleInvoice invoice) { this.invoice = invoice; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public ProductType getProductType() { return productType; }
    public void setProductType(ProductType productType) { this.productType = productType; }

    public Double getQuantity() { return quantity; }
    public void setQuantity(Double quantity) {
        this.quantity = quantity;
        if (this.quantity != null && this.unitPriceFcfa != null) {
            this.lineTotalFcfa = this.quantity * this.unitPriceFcfa;
        }
    }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public Double getUnitPriceFcfa() { return unitPriceFcfa; }
    public void setUnitPriceFcfa(Double unitPriceFcfa) {
        this.unitPriceFcfa = unitPriceFcfa;
        if (this.quantity != null && this.unitPriceFcfa != null) {
            this.lineTotalFcfa = this.quantity * this.unitPriceFcfa;
        }
    }

    public Double getLineTotalFcfa() { return lineTotalFcfa; }
    public void setLineTotalFcfa(Double lineTotalFcfa) { this.lineTotalFcfa = lineTotalFcfa; }
}
