package com.lawtan.entity;

import com.lawtan.model.MarketplaceOrderStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "marketplace_orders")
public class MarketplaceOrder {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String reference;

    @Column(unique = true, length = 80)
    private String idempotencyKey;

    @Column(nullable = false, length = 120)
    private String customerName;

    @Column(nullable = false, length = 40)
    private String customerPhone;

    @Column(length = 160)
    private String customerEmail;

    @Column(nullable = false, length = 255)
    private String deliveryAddress;

    @Column(nullable = false, length = 100)
    private String deliveryCity;

    @Column(columnDefinition = "TEXT")
    private String customerNote;

    @Column(nullable = false)
    @Builder.Default
    private Double totalAmountFcfa = 0.0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private MarketplaceOrderStatus status = MarketplaceOrderStatus.PENDING;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @Builder.Default
    private List<MarketplaceOrderItem> items = new ArrayList<>();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PrePersist
    void onCreate() { createdAt = LocalDateTime.now(); updatedAt = createdAt; }

    @PreUpdate
    void onUpdate() { updatedAt = LocalDateTime.now(); }

    public void addItem(MarketplaceOrderItem item) {
        item.setOrder(this);
        items.add(item);
    }
}