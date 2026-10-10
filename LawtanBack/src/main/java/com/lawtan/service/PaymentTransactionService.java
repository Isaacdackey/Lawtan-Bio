package com.lawtan.service;

import com.lawtan.dto.PaymentTransactionDTO;
import java.util.List;

public interface PaymentTransactionService {
    List<PaymentTransactionDTO> getAllPayments();
    List<PaymentTransactionDTO> getPaymentsByInvoiceId(Long invoiceId);
    List<PaymentTransactionDTO> getPaymentsByCustomerId(Long customerId);
}
