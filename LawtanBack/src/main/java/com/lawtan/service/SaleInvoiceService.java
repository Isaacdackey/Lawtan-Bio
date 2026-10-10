package com.lawtan.service;

import com.lawtan.dto.CommercialSummaryDTO;
import com.lawtan.dto.PaymentTransactionDTO;
import com.lawtan.dto.SaleInvoiceDTO;
import com.lawtan.model.InvoiceStatus;
import java.util.List;

public interface SaleInvoiceService {
    List<SaleInvoiceDTO> getAllInvoices();
    List<SaleInvoiceDTO> getInvoicesByStatus(InvoiceStatus status);
    List<SaleInvoiceDTO> getInvoicesByCustomerId(Long customerId);
    SaleInvoiceDTO getInvoiceById(Long id);
    SaleInvoiceDTO createInvoice(SaleInvoiceDTO invoiceDTO);
    SaleInvoiceDTO recordPayment(Long invoiceId, PaymentTransactionDTO paymentDTO);
    SaleInvoiceDTO updateInvoiceStatus(Long id, InvoiceStatus status);
    CommercialSummaryDTO getCommercialSummary();
    void deleteInvoice(Long id);
}
