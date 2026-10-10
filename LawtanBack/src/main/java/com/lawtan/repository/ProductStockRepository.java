package com.lawtan.repository;

import com.lawtan.entity.ProductStock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductStockRepository extends JpaRepository<ProductStock, Long> {
    List<ProductStock> findByQuantityAvailableGreaterThan(Double minQty);
    Optional<ProductStock> findByBatchId(Long batchId);

    @Query("SELECT SUM(s.totalValueFcfa) FROM ProductStock s WHERE s.quantityAvailable > 0")
    Double sumTotalStockValue();

    @Query("SELECT COUNT(s) FROM ProductStock s WHERE s.quantityAvailable > 0 AND s.dlcExpiryDate <= :thresholdDate")
    Long countStocksNearDlc(LocalDate thresholdDate);
}
