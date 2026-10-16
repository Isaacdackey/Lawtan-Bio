package com.lawtan.dto;

import com.lawtan.model.FeedbackCategory;

import java.util.List;
import java.util.Map;

public record FeedbackSummaryDTO(
        long totalCount,
        Double averageRating,           
        Double satisfactionRatePercent,
        Double averageRatingLast30Days,   
        Map<Integer, Long> ratingDistribution, 
        List<CategoryStat> byCategory
) {
    public record CategoryStat(FeedbackCategory category, String label, Double averageRating, long count) {

    }
}