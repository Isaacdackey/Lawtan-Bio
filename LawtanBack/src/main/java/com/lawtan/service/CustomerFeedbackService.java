package com.lawtan.service;

import com.lawtan.dto.CustomerFeedbackDTO;
import com.lawtan.dto.CustomerFeedbackRequest;
import com.lawtan.dto.FeedbackSummaryDTO;
import org.springframework.data.domain.Page;

public interface CustomerFeedbackService {
    CustomerFeedbackDTO create(CustomerFeedbackRequest request);
    Page<CustomerFeedbackDTO> list(Integer rating, int page, int size);
    FeedbackSummaryDTO getSummary();
    void delete(Long id);
}