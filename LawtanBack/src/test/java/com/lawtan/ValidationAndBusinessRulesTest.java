package com.lawtan;

import com.lawtan.dto.AnimalDTO;
import com.lawtan.dto.CustomerDTO;
import com.lawtan.dto.MilkProductionDTO;
import com.lawtan.dto.PaymentTransactionDTO;
import com.lawtan.dto.SaleInvoiceDTO;
import com.lawtan.exception.BusinessException;
import com.lawtan.model.AnimalCategory;
import com.lawtan.model.MilkSession;
import com.lawtan.service.AnimalService;
import com.lawtan.service.CustomerService;
import com.lawtan.service.MilkProductionService;
import com.lawtan.service.SaleInvoiceService;
import com.lawtan.util.PhoneUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class ValidationAndBusinessRulesTest {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private AnimalService animalService;

    @Autowired
    private MilkProductionService milkProductionService;

    @Autowired
    private SaleInvoiceService saleInvoiceService;

    @Test
    @DisplayName("Validation et normalisation des numéros de téléphone sénégalais")
    void testSenegalPhoneNormalization() {
        // Formats valides
        assertEquals("+221 77 123 45 67", PhoneUtils.normalizeSenegalPhone("77 123 45 67", false));
        assertEquals("+221 78 123 45 67", PhoneUtils.normalizeSenegalPhone("+221781234567", false));
        assertEquals("+221 76 987 65 43", PhoneUtils.normalizeSenegalPhone("00221 76 987 65 43", false));
        assertEquals("+221 70 111 22 33", PhoneUtils.normalizeSenegalPhone("701112233", false));
        assertEquals("+221 33 821 00 00", PhoneUtils.normalizeSenegalPhone("33 821 00 00", false));

        // Formats invalides (doivent lever BusinessException)
        assertThrows(BusinessException.class, () -> PhoneUtils.normalizeSenegalPhone("123456", false));
        assertThrows(BusinessException.class, () -> PhoneUtils.normalizeSenegalPhone("99 123 45 67", false)); // 99 n'est pas sénégalais
        assertThrows(BusinessException.class, () -> PhoneUtils.normalizeSenegalPhone("77 123 45", false)); // Moins de 9 chiffres
        assertThrows(BusinessException.class, () -> PhoneUtils.normalizeSenegalPhone(null, true)); // Obligatoire
    }

    @Test
    @DisplayName("Blocage strict des doublons de téléphone client")
    void testCustomerDuplicatePhoneRejection() {
        CustomerDTO c1 = new CustomerDTO();
        c1.setName("Client Test 1");
        c1.setPhone("77 888 99 00");
        customerService.createCustomer(c1);

        // Deuxième client avec le même numéro (même si saisi avec +221)
        CustomerDTO c2 = new CustomerDTO();
        c2.setName("Client Test 2");
        c2.setPhone("+221 77 888 99 00");

        BusinessException ex = assertThrows(BusinessException.class, () -> customerService.createCustomer(c2));
        assertTrue(ex.getMessage().contains("est déjà enregistré"));
    }

    @Test
    @DisplayName("Incohérence biologique : refus de la traite pour un mâle")
    void testMaleMilkingRejection() {
        AnimalDTO bull = AnimalDTO.builder()
                .internalId("TEST-BULL-01")
                .name("Taureau Titan")
                .gender("MALE")
                .category(AnimalCategory.TAUREAU)
                .breed("Guzera")
                .build();
        animalService.createAnimal(bull);

        MilkProductionDTO milk = MilkProductionDTO.builder()
                .animalInternalId("TEST-BULL-01")
                .volumeLiters(10.0)
                .session(MilkSession.MORNING)
                .productionDate(LocalDate.now())
                .build();

        BusinessException ex = assertThrows(BusinessException.class, () -> milkProductionService.recordMilkProduction(milk));
        assertTrue(ex.getMessage().contains("Incohérence biologique"));
    }

    @Test
    @DisplayName("Paiement excédentaire sur facture bloqué")
    void testOverpaymentRejection() {
        CustomerDTO cust = new CustomerDTO();
        cust.setName("Client Facture Test");
        cust.setPhone("78 999 00 11");
        CustomerDTO createdCust = customerService.createCustomer(cust);

        SaleInvoiceDTO inv = new SaleInvoiceDTO();
        inv.setCustomerId(createdCust.getId());
        inv.setPaidAmountFcfa(0.0);
        inv.setIssueDate(LocalDate.now());
        inv.setDueDate(LocalDate.now().plusDays(10));
        SaleInvoiceDTO createdInv = saleInvoiceService.createInvoice(inv);

        // Tentative de payer 50 000 FCFA sur une facture dont le solde est 0
        PaymentTransactionDTO payment = new PaymentTransactionDTO();
        payment.setAmountPaidFcfa(50000.0);

        BusinessException ex = assertThrows(BusinessException.class, () -> saleInvoiceService.recordPayment(createdInv.getId(), payment));
        assertTrue(ex.getMessage().contains("Paiement excédentaire") || ex.getMessage().contains("supérieur au reste"));
    }
}
