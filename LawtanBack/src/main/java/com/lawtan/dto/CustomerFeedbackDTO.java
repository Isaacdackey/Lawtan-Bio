package com.lawtan.dto;

import com.lawtan.model.FeedbackCategory;
import com.lawtan.model.FeedbackSource;

import java.time.LocalDateTime;

public record CustomerFeedbackDTO(
        Long id,
        Long customerId,
        String customerName,
        Integer rating,
        FeedbackCategory category,
        String categoryLabel,
        FeedbackSource source,
        String sourceLabel,
        String orderReference,
        String comment,
        LocalDateTime createdAt
) {
}