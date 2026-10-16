package com.lawtan.service.impl;

import com.lawtan.dto.CustomerFeedbackDTO;
import com.lawtan.dto.CustomerFeedbackRequest;
import com.lawtan.dto.FeedbackSummaryDTO;
import com.lawtan.entity.Customer;
import com.lawtan.entity.CustomerFeedback;
import com.lawtan.exception.BusinessException;
import com.lawtan.model.FeedbackCategory;
import com.lawtan.model.FeedbackSource;
import com.lawtan.repository.CustomerFeedbackRepository;
import com.lawtan.repository.CustomerRepository;
import com.lawtan.service.CustomerFeedbackService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomerFeedbackServiceImpl implements CustomerFeedbackService {

    private final CustomerFeedbackRepository feedbackRepository;
    private final CustomerRepository customerRepository;

    @Override
    @Transactional
    public CustomerFeedbackDTO create(CustomerFeedbackRequest request) {
        CustomerFeedback feedback = new CustomerFeedback();

        String name = blankToNull(request.customerName());
        if (request.customerId() != null) {
            Customer customer = customerRepository.findById(request.customerId())
                    .orElseThrow(() -> new BusinessException(
                            "Client introuvable (id=" + request.customerId() + ").", HttpStatus.NOT_FOUND));
            feedback.setCustomer(customer);
            String company = blankToNull(customer.getCompanyName());
            name = company != null ? company : customer.getName();
        }
        feedback.setCustomerName(name != null ? name : "Anonyme");
        feedback.setRating(request.rating());
        feedback.setCategory(request.category() != null ? request.category() : FeedbackCategory.OTHER);
        feedback.setSource(request.source() != null ? request.source() : FeedbackSource.OTHER);
        feedback.setOrderReference(blankToNull(request.orderReference()));
        feedback.setComment(blankToNull(request.comment()));

        return toDTO(feedbackRepository.save(feedback));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerFeedbackDTO> list(Integer rating, int page, int size) {
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100));
        Page<CustomerFeedback> result = rating != null
                ? feedbackRepository.findByRatingOrderByCreatedAtDesc(rating, pageable)
                : feedbackRepository.findAllByOrderByCreatedAtDesc(pageable);
        return result.map(this::toDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public FeedbackSummaryDTO getSummary() {
        Map<Integer, Long> distribution = new LinkedHashMap<>();
        for (int stars = 1; stars <= 5; stars++) {
            distribution.put(stars, 0L);
        }
        for (Object[] row : feedbackRepository.countByRating()) {
            distribution.put(((Number) row[0]).intValue(), ((Number) row[1]).longValue());
        }
        long total = distribution.values().stream().mapToLong(Long::longValue).sum();
        long satisfied = distribution.get(4) + distribution.get(5);

        Double average = round1(feedbackRepository.averageRating());
        Double last30 = round1(feedbackRepository.averageRatingSince(LocalDateTime.now().minusDays(30)));
        Double satisfactionRate = total > 0 ? round1(satisfied * 100.0 / total) : null;

        List<FeedbackSummaryDTO.CategoryStat> byCategory = new ArrayList<>();
        for (Object[] row : feedbackRepository.statsByCategory()) {
            FeedbackCategory category = (FeedbackCategory) row[0];
            byCategory.add(new FeedbackSummaryDTO.CategoryStat(
                    category, category.getLabel(), round1((Double) row[1]), ((Number) row[2]).longValue()));
        }
        byCategory.sort(Comparator.comparingLong(FeedbackSummaryDTO.CategoryStat::count).reversed());

        return new FeedbackSummaryDTO(total, average, satisfactionRate, last30, distribution, byCategory);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!feedbackRepository.existsById(id)) {
            throw new BusinessException("Avis introuvable (id=" + id + ").", HttpStatus.NOT_FOUND);
        }
        feedbackRepository.deleteById(id);
    }

    private CustomerFeedbackDTO toDTO(CustomerFeedback f) {
        return new CustomerFeedbackDTO(
                f.getId(),
                f.getCustomer() != null ? f.getCustomer().getId() : null,
                f.getCustomerName(),
                f.getRating(),
                f.getCategory(),
                f.getCategory() != null ? f.getCategory().getLabel() : null,
                f.getSource(),
                f.getSource() != null ? f.getSource().getLabel() : null,
                f.getOrderReference(),
                f.getComment(),
                f.getCreatedAt());
    }

    private static Double round1(Double v) {
        return v == null ? null : Math.round(v * 10.0) / 10.0;
    }

    private static String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}