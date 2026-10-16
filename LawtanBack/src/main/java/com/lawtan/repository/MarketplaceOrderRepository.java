package com.lawtan.repository;

import com.lawtan.entity.MarketplaceOrder;
import com.lawtan.model.MarketplaceOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface MarketplaceOrderRepository extends JpaRepository<MarketplaceOrder, Long> {
    Optional<MarketplaceOrder> findByReference(String reference);
    Optional<MarketplaceOrder> findByIdempotencyKey(String idempotencyKey);
    Page<MarketplaceOrder> findAllByOrderByCreatedAtDesc(Pageable pageable);
    Page<MarketplaceOrder> findByStatusOrderByCreatedAtDesc(MarketplaceOrderStatus status, Pageable pageable);
}
