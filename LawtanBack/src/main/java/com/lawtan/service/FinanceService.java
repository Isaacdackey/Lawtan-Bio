package com.lawtan.service;

import com.lawtan.dto.FinanceSummaryDTO;

import java.time.LocalDate;

public interface FinanceService {

    /**
     * Synthèse financière réelle sur une période. Si les bornes sont nulles,
     * la période retenue est le mois calendaire en cours.
     */
    FinanceSummaryDTO getFinanceSummary(LocalDate from, LocalDate to);
}
