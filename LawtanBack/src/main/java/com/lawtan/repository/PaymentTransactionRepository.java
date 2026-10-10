package com.lawtan.repository;

import com.lawtan.entity.PaymentTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, Long> {
    List<PaymentTransaction> findByInvoiceIdOrderByPaymentDateDesc(Long invoiceId);
    List<PaymentTransaction> findByCustomerIdOrderByPaymentDateDesc(Long customerId);
    List<PaymentTransaction> findAllByOrderByPaymentDateDesc();
}
