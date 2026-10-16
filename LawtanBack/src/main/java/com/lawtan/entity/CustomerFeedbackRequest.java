package com.lawtan.dto;

import com.lawtan.model.FeedbackCategory;
import com.lawtan.model.FeedbackSource;
import jakarta.validation.constraints.*;

public record CustomerFeedbackRequest(
        Long customerId,

        @Size(max = 120, message = "Nom du client trop long (120 caractères max)")
        String customerName,

        @NotNull(message = "La note est obligatoire")
        @Min(value = 1, message = "La note doit être comprise entre 1 et 5")
        @Max(value = 5, message = "La note doit être comprise entre 1 et 5")
        Integer rating,

        FeedbackCategory category,
        FeedbackSource source,

        @Size(max = 40, message = "Référence trop longue (40 caractères max)")
        String orderReference,

        @Size(max = 2000, message = "Commentaire trop long (2000 caractères max)")
        String comment
) {
}