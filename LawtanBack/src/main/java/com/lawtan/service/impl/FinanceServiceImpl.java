package com.lawtan.service.impl;

import com.lawtan.dto.FinanceSummaryDTO;
import com.lawtan.entity.FeedDistribution;
import com.lawtan.entity.HealthRecord;
import com.lawtan.entity.MilkProduction;
import com.lawtan.entity.SaleInvoice;
import com.lawtan.model.InvoiceStatus;
import com.lawtan.repository.FeedDistributionRepository;
import com.lawtan.repository.HealthRecordRepository;
import com.lawtan.repository.MilkProductionRepository;
import com.lawtan.repository.SaleInvoiceRepository;
import com.lawtan.service.FinanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private static final Locale FR = Locale.FRENCH;

    private final SaleInvoiceRepository saleInvoiceRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final FeedDistributionRepository feedDistributionRepository;
    private final MilkProductionRepository milkProductionRepository;

    @Override
    @Transactional(readOnly = true)
    public FinanceSummaryDTO getFinanceSummary(LocalDate from, LocalDate to) {
        YearMonth currentMonth = YearMonth.now();
        LocalDate start = from != null ? from : currentMonth.atDay(1);
        LocalDate end = to != null ? to : currentMonth.atEndOfMonth();

        List<SaleInvoice> invoices = saleInvoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() != InvoiceStatus.CANCELLED)
                .filter(i -> inRange(i.getIssueDate(), start, end))
                .toList();

        double revenue = invoices.stream().mapToDouble(i -> nz(i.getTotalAmountFcfa())).sum();
        double collected = invoices.stream().mapToDouble(i -> nz(i.getPaidAmountFcfa())).sum();

        double feedCost = feedDistributionRepository.findAll().stream()
                .filter(d -> inRange(d.getDistributionDate(), start, end))
                .mapToDouble(d -> nz(d.getTotalCostFcfa())).sum();

        double healthCost = healthRecordRepository.findAll().stream()
                .filter(h -> inRange(h.getRecordDate(), start, end))
                .mapToDouble(h -> nz(h.getCostFcfa())).sum();

        double charges = feedCost + healthCost;
        double profit = revenue - charges;

        double milkLiters = milkProductionRepository
                .findByProductionDateBetweenOrderByProductionDateAsc(start, end).stream()
                .mapToDouble(m -> nz(m.getVolumeLiters())).sum();

        List<FinanceSummaryDTO.CostLine> breakdown = new ArrayList<>();
        breakdown.add(costLine("Alimentation & Fourrage", "feed_distributions", feedCost, charges));
        breakdown.add(costLine("Soins Vétérinaires & Vaccins", "health_records", healthCost, charges));

        return FinanceSummaryDTO.builder()
                .periodLabel(monthLabel(YearMonth.from(start)) + " " + start.getYear())
                .periodStart(start.toString())
                .periodEnd(end.toString())
                .totalRevenueFcfa(round(revenue))
                .totalCollectedFcfa(round(collected))
                .totalChargesFcfa(round(charges))
                .netProfitFcfa(round(profit))
                .netMarginPercentage(revenue > 0 ? round(profit / revenue * 100.0) : 0.0)
                .milkLitersProduced(round(milkLiters))
                .costPerLiterFcfa(milkLiters > 0 ? round(charges / milkLiters) : 0.0)
                .invoicesCount(invoices.size())
                .costBreakdown(breakdown)
                .monthlySeries(buildMonthlySeries(YearMonth.from(end)))
                .build();
    }

    /** Six derniers mois glissants : recettes facturées et charges tracées, mois par mois. */
    private List<FinanceSummaryDTO.MonthPoint> buildMonthlySeries(YearMonth lastMonth) {
        List<SaleInvoice> allInvoices = saleInvoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() != InvoiceStatus.CANCELLED)
                .toList();
        List<FeedDistribution> allFeed = feedDistributionRepository.findAll();
        List<HealthRecord> allHealth = healthRecordRepository.findAll();

        List<FinanceSummaryDTO.MonthPoint> series = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            YearMonth ym = lastMonth.minusMonths(i);
            LocalDate mStart = ym.atDay(1);
            LocalDate mEnd = ym.atEndOfMonth();

            double rev = allInvoices.stream()
                    .filter(inv -> inRange(inv.getIssueDate(), mStart, mEnd))
                    .mapToDouble(inv -> nz(inv.getTotalAmountFcfa())).sum();

            double chg = allFeed.stream()
                    .filter(d -> inRange(d.getDistributionDate(), mStart, mEnd))
                    .mapToDouble(d -> nz(d.getTotalCostFcfa())).sum()
                    + allHealth.stream()
                    .filter(h -> inRange(h.getRecordDate(), mStart, mEnd))
                    .mapToDouble(h -> nz(h.getCostFcfa())).sum();

            series.add(FinanceSummaryDTO.MonthPoint.builder()
                    .label(monthLabel(ym))
                    .month(ym.toString())
                    .revenueFcfa(round(rev))
                    .chargesFcfa(round(chg))
                    .build());
        }
        return series;
    }

    private FinanceSummaryDTO.CostLine costLine(String label, String source, double amount, double total) {
        return FinanceSummaryDTO.CostLine.builder()
                .label(label)
                .source(source)
                .amountFcfa(round(amount))
                .percentage(total > 0 ? round(amount / total * 100.0) : 0.0)
                .build();
    }

    private static String monthLabel(YearMonth ym) {
        String s = ym.getMonth().getDisplayName(TextStyle.SHORT, FR);
        return s.substring(0, 1).toUpperCase(FR) + s.substring(1);
    }

    private static boolean inRange(LocalDate date, LocalDate start, LocalDate end) {
        return date != null && !date.isBefore(start) && !date.isAfter(end);
    }

    private static double nz(Double v) {
        return v != null ? v : 0.0;
    }

    private static double round(double v) {
        return Math.round(v * 10.0) / 10.0;
    }
}
