package com.lawtan.controller;

import com.lawtan.dto.CommercialSummaryDTO;
import com.lawtan.dto.CustomerDTO;
import com.lawtan.dto.PaymentTransactionDTO;
import com.lawtan.dto.SaleInvoiceDTO;
import com.lawtan.model.CustomerType;
import com.lawtan.model.InvoiceStatus;
import com.lawtan.service.CustomerService;
import com.lawtan.service.PaymentTransactionService;
import com.lawtan.service.SaleInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class CommercialController {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private SaleInvoiceService saleInvoiceService;

    @Autowired
    private PaymentTransactionService paymentTransactionService;

    // --- CLIENTS ---
    @GetMapping("/customers")
    public ResponseEntity<List<CustomerDTO>> getAllCustomers(@RequestParam(required = false) CustomerType type) {
        if (type != null) {
            return ResponseEntity.ok(customerService.getCustomersByType(type));
        }
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/customers/{id}")
    public ResponseEntity<CustomerDTO> getCustomerById(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCustomerById(id));
    }

    @PostMapping("/customers")
    public ResponseEntity<CustomerDTO> createCustomer(@RequestBody CustomerDTO dto) {
        return new ResponseEntity<>(customerService.createCustomer(dto), HttpStatus.CREATED);
    }

    @PutMapping("/customers/{id}")
    public ResponseEntity<CustomerDTO> updateCustomer(@PathVariable Long id, @RequestBody CustomerDTO dto) {
        return ResponseEntity.ok(customerService.updateCustomer(id, dto));
    }

    @DeleteMapping("/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    // --- FACTURES & VENTES ---
    @GetMapping("/invoices")
    public ResponseEntity<List<SaleInvoiceDTO>> getAllInvoices(
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) Long customerId) {
        if (status != null) {
            return ResponseEntity.ok(saleInvoiceService.getInvoicesByStatus(status));
        }
        if (customerId != null) {
            return ResponseEntity.ok(saleInvoiceService.getInvoicesByCustomerId(customerId));
        }
        return ResponseEntity.ok(saleInvoiceService.getAllInvoices());
    }

    @GetMapping("/invoices/{id}")
    public ResponseEntity<SaleInvoiceDTO> getInvoiceById(@PathVariable Long id) {
        return ResponseEntity.ok(saleInvoiceService.getInvoiceById(id));
    }

    @PostMapping("/invoices")
    public ResponseEntity<?> createInvoice(@RequestBody SaleInvoiceDTO dto) {
        try {
            return ResponseEntity.status(HttpStatus.CREATED).body(saleInvoiceService.createInvoice(dto));
        } catch (IllegalArgumentException e) {
            // Lait cru facture au-dela du stock disponible : refus explicite
            return ResponseEntity.badRequest().body(java.util.Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/invoices/{id}/pay")
    public ResponseEntity<SaleInvoiceDTO> recordPayment(
            @PathVariable Long id,
            @RequestBody PaymentTransactionDTO paymentDTO) {
        return ResponseEntity.ok(saleInvoiceService.recordPayment(id, paymentDTO));
    }

    @PatchMapping("/invoices/{id}/status")
    public ResponseEntity<SaleInvoiceDTO> updateInvoiceStatus(
            @PathVariable Long id,
            @RequestParam InvoiceStatus status) {
        return ResponseEntity.ok(saleInvoiceService.updateInvoiceStatus(id, status));
    }

    @DeleteMapping("/invoices/{id}")
    public ResponseEntity<Void> deleteInvoice(@PathVariable Long id) {
        saleInvoiceService.deleteInvoice(id);
        return ResponseEntity.noContent().build();
    }

    // --- PAIEMENTS & JOURNAL ---
    @GetMapping("/payments")
    public ResponseEntity<List<PaymentTransactionDTO>> getAllPayments(
            @RequestParam(required = false) Long invoiceId,
            @RequestParam(required = false) Long customerId) {
        if (invoiceId != null) {
            return ResponseEntity.ok(paymentTransactionService.getPaymentsByInvoiceId(invoiceId));
        }
        if (customerId != null) {
            return ResponseEntity.ok(paymentTransactionService.getPaymentsByCustomerId(customerId));
        }
        return ResponseEntity.ok(paymentTransactionService.getAllPayments());
    }

    // --- SYNTHÈSE COMMERCIALE ---
    @GetMapping("/commercial/summary")
    public ResponseEntity<CommercialSummaryDTO> getCommercialSummary() {
        return ResponseEntity.ok(saleInvoiceService.getCommercialSummary());
    }
}