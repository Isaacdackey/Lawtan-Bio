package com.lawtan.repository;

import com.lawtan.entity.SaleInvoice;
import com.lawtan.model.InvoiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SaleInvoiceRepository extends JpaRepository<SaleInvoice, Long> {
    Optional<SaleInvoice> findByInvoiceNumber(String invoiceNumber);
    List<SaleInvoice> findByStatus(InvoiceStatus status);
    List<SaleInvoice> findByCustomerIdOrderByIssueDateDesc(Long customerId);
    List<SaleInvoice> findAllByOrderByIssueDateDesc();

    @Query("SELECT COALESCE(SUM(i.totalAmountFcfa), 0.0) FROM SaleInvoice i WHERE i.status <> 'CANCELLED'")
    Double sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(i.paidAmountFcfa), 0.0) FROM SaleInvoice i WHERE i.status <> 'CANCELLED'")
    Double sumTotalCollected();

    @Query("SELECT COALESCE(SUM(i.remainingAmountFcfa), 0.0) FROM SaleInvoice i WHERE i.status <> 'CANCELLED'")
    Double sumTotalOutstanding();

    Long countByStatus(InvoiceStatus status);
}
