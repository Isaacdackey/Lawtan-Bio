package com.lawtan.controller;

import com.lawtan.dto.CustomerFeedbackDTO;
import com.lawtan.dto.CustomerFeedbackRequest;
import com.lawtan.dto.FeedbackSummaryDTO;
import com.lawtan.service.CustomerFeedbackService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/feedback")
@RequiredArgsConstructor
@Tag(name = "Satisfaction client", description = "Avis clients et indicateur de satisfaction")
public class CustomerFeedbackController {

    private final CustomerFeedbackService feedbackService;

    @PostMapping
    @Operation(summary = "Enregistrer un avis client (note de 1 à 5)")
    public ResponseEntity<CustomerFeedbackDTO> create(@Valid @RequestBody CustomerFeedbackRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(feedbackService.create(request));
    }

    @GetMapping
    @Operation(summary = "Lister les avis (du plus récent au plus ancien), filtrable par note")
    public Page<CustomerFeedbackDTO> list(
            @RequestParam(required = false) Integer rating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return feedbackService.list(rating, page, size);
    }

    @GetMapping("/summary")
    @Operation(summary = "Synthèse : note moyenne, taux de satisfaction, répartition par note et par thème")
    public ResponseEntity<FeedbackSummaryDTO> summary() {
        return ResponseEntity.ok(feedbackService.getSummary());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Supprimer un avis")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        feedbackService.delete(id);
        return ResponseEntity.noContent().build();
    }
}