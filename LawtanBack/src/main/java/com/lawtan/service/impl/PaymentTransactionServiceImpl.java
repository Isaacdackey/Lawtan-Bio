package com.lawtan.service.impl;

import com.lawtan.dto.PaymentTransactionDTO;
import com.lawtan.entity.PaymentTransaction;
import com.lawtan.repository.PaymentTransactionRepository;
import com.lawtan.service.PaymentTransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    @Autowired
    private PaymentTransactionRepository paymentTransactionRepository;

    @Override
    public List<PaymentTransactionDTO> getAllPayments() {
        return paymentTransactionRepository.findAllByOrderByPaymentDateDesc()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<PaymentTransactionDTO> getPaymentsByInvoiceId(Long invoiceId) {
        return paymentTransactionRepository.findByInvoiceIdOrderByPaymentDateDesc(invoiceId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<PaymentTransactionDTO> getPaymentsByCustomerId(Long customerId) {
        return paymentTransactionRepository.findByCustomerIdOrderByPaymentDateDesc(customerId)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private PaymentTransactionDTO convertToDTO(PaymentTransaction entity) {
        PaymentTransactionDTO dto = new PaymentTransactionDTO();
        dto.setId(entity.getId());
        if (entity.getInvoice() != null) {
            dto.setInvoiceId(entity.getInvoice().getId());
            dto.setInvoiceNumber(entity.getInvoice().getInvoiceNumber());
        }
        if (entity.getCustomer() != null) {
            dto.setCustomerId(entity.getCustomer().getId());
            dto.setCustomerName(entity.getCustomer().getName());
        }
        dto.setPaymentDate(entity.getPaymentDate());
        dto.setAmountPaidFcfa(entity.getAmountPaidFcfa());
        dto.setPaymentMethod(entity.getPaymentMethod());
        dto.setTransactionReference(entity.getTransactionReference());
        dto.setReceiptNumber(entity.getReceiptNumber());
        dto.setReceivedBy(entity.getReceivedBy());
        dto.setNotes(entity.getNotes());
        return dto;
    }
}
