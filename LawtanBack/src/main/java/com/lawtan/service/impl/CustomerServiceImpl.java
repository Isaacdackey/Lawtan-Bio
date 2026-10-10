package com.lawtan.service.impl;

import com.lawtan.dto.CustomerDTO;
import com.lawtan.entity.Customer;
import com.lawtan.exception.BusinessException;
import com.lawtan.model.CustomerType;
import com.lawtan.repository.CustomerRepository;
import com.lawtan.repository.SaleInvoiceRepository;
import com.lawtan.service.CustomerService;
import com.lawtan.util.PhoneUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
public class CustomerServiceImpl implements CustomerService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$");

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private SaleInvoiceRepository saleInvoiceRepository;

    @Override
    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findByActiveTrueOrderByTotalSpentFcfaDesc()
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public List<CustomerDTO> getCustomersByType(CustomerType customerType) {
        return customerRepository.findByCustomerTypeAndActiveTrue(customerType)
                .stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    @Override
    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Client introuvable avec l'ID: " + id, HttpStatus.NOT_FOUND));
        return convertToDTO(customer);
    }

    @Override
    public CustomerDTO createCustomer(CustomerDTO dto) {
        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BusinessException("Le nom du client est obligatoire.", HttpStatus.BAD_REQUEST);
        }

        String normalizedPhone = PhoneUtils.normalizeSenegalPhone(dto.getPhone(), false);
        validateUniqueness(normalizedPhone, dto.getEmail(), dto.getNineaNumber(), null);

        Customer customer = new Customer();
        customer.setName(dto.getName().trim());
        customer.setCompanyName(dto.getCompanyName() != null ? dto.getCompanyName().trim() : null);
        customer.setCustomerType(dto.getCustomerType() != null ? dto.getCustomerType() : CustomerType.INDIVIDUAL);
        customer.setPhone(normalizedPhone);
        customer.setEmail(cleanString(dto.getEmail()));
        customer.setAddress(cleanString(dto.getAddress()));
        customer.setCity(dto.getCity() != null && !dto.getCity().isBlank() ? dto.getCity().trim() : "Dakar");
        customer.setNineaNumber(cleanString(dto.getNineaNumber()));
        customer.setNotes(cleanString(dto.getNotes()));
        customer.setTotalOrdersCount(0);
        customer.setTotalSpentFcfa(0.0);
        customer.setBalanceDueFcfa(0.0);
        customer.setActive(true);
        customer.setCreatedAt(LocalDateTime.now());

        Customer saved = customerRepository.save(customer);
        return convertToDTO(saved);
    }

    @Override
    public CustomerDTO updateCustomer(Long id, CustomerDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Client introuvable avec l'ID: " + id, HttpStatus.NOT_FOUND));

        if (dto.getName() == null || dto.getName().trim().isEmpty()) {
            throw new BusinessException("Le nom du client est obligatoire.", HttpStatus.BAD_REQUEST);
        }

        String normalizedPhone = PhoneUtils.normalizeSenegalPhone(dto.getPhone(), false);
        validateUniqueness(normalizedPhone, dto.getEmail(), dto.getNineaNumber(), id);

        customer.setName(dto.getName().trim());
        customer.setCompanyName(cleanString(dto.getCompanyName()));
        if (dto.getCustomerType() != null) customer.setCustomerType(dto.getCustomerType());
        customer.setPhone(normalizedPhone);
        customer.setEmail(cleanString(dto.getEmail()));
        customer.setAddress(cleanString(dto.getAddress()));
        if (dto.getCity() != null) customer.setCity(dto.getCity().trim());
        customer.setNineaNumber(cleanString(dto.getNineaNumber()));
        customer.setNotes(cleanString(dto.getNotes()));

        Customer saved = customerRepository.save(customer);
        return convertToDTO(saved);
    }

    @Override
    public void deleteCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Client introuvable avec l'ID: " + id, HttpStatus.NOT_FOUND));

        // Interdiction de suppression si le client a une dette impayée en cours
        if (customer.getBalanceDueFcfa() != null && customer.getBalanceDueFcfa() > 0) {
            throw new BusinessException(
                "Impossible de supprimer le client '" + customer.getName() + "' : une dette de " +
                String.format("%,d", customer.getBalanceDueFcfa().longValue()).replace(',', ' ') +
                " FCFA est toujours en cours. Veuillez solder toutes les créances avant suppression.",
                HttpStatus.BAD_REQUEST
            );
        }

        // Vérifier si le client a un historique de factures
        boolean hasInvoices = !saleInvoiceRepository.findByCustomerIdOrderByIssueDateDesc(id).isEmpty();
        if (hasInvoices) {
            // Soft delete pour préserver l'historique comptable et de facturation
            customer.setActive(false);
            customerRepository.save(customer);
        } else {
            customerRepository.delete(customer);
        }
    }

    private void validateUniqueness(String normalizedPhone, String email, String nineaNumber, Long excludeId) {
        // Téléphone
        if (normalizedPhone != null) {
            boolean phoneExists = (excludeId == null)
                    ? customerRepository.existsByPhone(normalizedPhone)
                    : customerRepository.existsByPhoneAndIdNot(normalizedPhone, excludeId);
            if (phoneExists) {
                throw new BusinessException(
                        "Un client avec le numéro de téléphone '" + normalizedPhone + "' est déjà enregistré dans le système.",
                        HttpStatus.CONFLICT
                );
            }
        }

        // Email
        String cleanEmail = cleanString(email);
        if (cleanEmail != null) {
            if (!EMAIL_PATTERN.matcher(cleanEmail).matches()) {
                throw new BusinessException("Format d'adresse email invalide : '" + email + "'", HttpStatus.BAD_REQUEST);
            }
            boolean emailExists = (excludeId == null)
                    ? customerRepository.existsByEmailIgnoreCase(cleanEmail)
                    : customerRepository.existsByEmailIgnoreCaseAndIdNot(cleanEmail, excludeId);
            if (emailExists) {
                throw new BusinessException(
                        "Un client avec l'adresse email '" + cleanEmail + "' existe déjà.",
                        HttpStatus.CONFLICT
                );
            }
        }

        // NINEA
        String cleanNinea = cleanString(nineaNumber);
        if (cleanNinea != null) {
            boolean nineaExists = (excludeId == null)
                    ? customerRepository.existsByNineaNumber(cleanNinea)
                    : customerRepository.existsByNineaNumberAndIdNot(cleanNinea, excludeId);
            if (nineaExists) {
                throw new BusinessException(
                        "Un client avec le numéro NINEA '" + cleanNinea + "' est déjà enregistré.",
                        HttpStatus.CONFLICT
                );
            }
        }
    }

    private String cleanString(String s) {
        if (s == null || s.trim().isEmpty()) return null;
        return s.trim();
    }

    private CustomerDTO convertToDTO(Customer entity) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        dto.setCompanyName(entity.getCompanyName());
        dto.setCustomerType(entity.getCustomerType());
        dto.setPhone(entity.getPhone());
        dto.setEmail(entity.getEmail());
        dto.setAddress(entity.getAddress());
        dto.setCity(entity.getCity());
        dto.setNineaNumber(entity.getNineaNumber());
        dto.setTotalOrdersCount(entity.getTotalOrdersCount());
        dto.setTotalSpentFcfa(entity.getTotalSpentFcfa());
        dto.setBalanceDueFcfa(entity.getBalanceDueFcfa());
        dto.setNotes(entity.getNotes());
        dto.setActive(entity.getActive());
        dto.setCreatedAt(entity.getCreatedAt());
        return dto;
    }
}
