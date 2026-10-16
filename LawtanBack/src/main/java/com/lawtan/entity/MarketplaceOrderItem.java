package com.lawtan.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "marketplace_order_items")
public class MarketplaceOrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private MarketplaceOrder order;

    @Column(nullable = false)
    private Long productStockId;

    @Column(nullable = false, length = 120)
    private String productName;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false, length = 30)
    private String unit;

    @Column(nullable = false)
    private Double unitPriceFcfa;

    @Column(nullable = false)
    private Double lineTotalFcfa;
}