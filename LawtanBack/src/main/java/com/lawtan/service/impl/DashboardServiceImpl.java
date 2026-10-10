package com.lawtan.service.impl;

import com.lawtan.dto.AnimalDTO;
import com.lawtan.dto.DashboardStatsDTO;
import com.lawtan.entity.InvoiceItem;
import com.lawtan.entity.MilkProduction;
import com.lawtan.entity.SaleInvoice;
import com.lawtan.entity.SolarEnergyMetric;
import com.lawtan.model.AnimalCategory;
import com.lawtan.model.AnimalStatus;
import com.lawtan.model.InvoiceStatus;
import com.lawtan.model.MilkSession;
import com.lawtan.model.ProductType;
import com.lawtan.repository.*;
import com.lawtan.service.AnimalService;
import com.lawtan.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final AnimalRepository animalRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final AnimalService animalService;
    private final MilkProductionRepository milkProductionRepository;
    private final SaleInvoiceRepository saleInvoiceRepository;
    private final SolarEnergyMetricRepository solarEnergyMetricRepository;
    private final FeedDistributionRepository feedDistributionRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        List<AnimalDTO> allAnimals = animalService.getAllAnimals();
        List<AnimalDTO> milkingCows = allAnimals.stream()
                .filter(a -> "En lactation".equalsIgnoreCase(a.getLactationStatus()) 
                        || a.getCategory() == AnimalCategory.VACHE 
                        || a.getCategory() == AnimalCategory.MILKING_COW)
                .toList();

        long femalesCount = allAnimals.stream()
                .filter(a -> "FEMALE".equalsIgnoreCase(a.getGender())
                        || a.getCategory() == AnimalCategory.VACHE
                        || a.getCategory() == AnimalCategory.GENISSE
                        || a.getCategory() == AnimalCategory.VELLE
                        || a.getCategory() == AnimalCategory.MILKING_COW
                        || a.getCategory() == AnimalCategory.HEIFER_YOUNG)
                .count();

        long bullsCount = allAnimals.stream()
                .filter(a -> a.getCategory() == AnimalCategory.TAUREAU
                        || a.getCategory() == AnimalCategory.JEUNE_MALE
                        || a.getCategory() == AnimalCategory.VEAU
                        || a.getCategory() == AnimalCategory.MALE_BULL)
                .count();

        long healthAlerts = allAnimals.stream()
                .filter(a -> a.getStatus() == AnimalStatus.FEVER_TREATMENT || Boolean.TRUE.equals(a.getCullingRecommended()))
                .count();

        LocalDate today = LocalDate.now();
        List<MilkProduction> todayProds = milkProductionRepository.findByProductionDate(today);

        double morningSum = todayProds.stream()
                .filter(p -> p.getSession() == MilkSession.MORNING)
                .mapToDouble(MilkProduction::getVolumeLiters).sum();

        double eveningSum = todayProds.stream()
                .filter(p -> p.getSession() == MilkSession.EVENING)
                .mapToDouble(MilkProduction::getVolumeLiters).sum();

        double realDailyTotal = Math.round((morningSum + eveningSum) * 10.0) / 10.0;
        long cowsMilkedCount = todayProds.stream().map(p -> p.getAnimal().getId()).distinct().count();
        double avgPerCow = cowsMilkedCount > 0 ? Math.round((realDailyTotal / cowsMilkedCount) * 10.0) / 10.0 : 0.0;

        // Historique 7 jours réel
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            List<MilkProduction> dayProds = milkProductionRepository.findByProductionDate(d);
            double mVol = dayProds.stream().filter(p -> p.getSession() == MilkSession.MORNING).mapToDouble(MilkProduction::getVolumeLiters).sum();
            double eVol = dayProds.stream().filter(p -> p.getSession() == MilkSession.EVENING).mapToDouble(MilkProduction::getVolumeLiters).sum();
            double tot = Math.round((mVol + eVol) * 10.0) / 10.0;

            String dayLabel = d.getDayOfWeek().getDisplayName(TextStyle.SHORT, Locale.FRENCH);
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("day", dayLabel);
            dayMap.put("morning", Math.round(mVol * 10.0) / 10.0);
            dayMap.put("evening", Math.round(eVol * 10.0) / 10.0);
            dayMap.put("total", tot);
            weeklyData.add(dayMap);
        }

        // Chiffre d'affaires réel
        Double totalRevenue = saleInvoiceRepository.sumTotalRevenue();
        double monthlyRev = totalRevenue != null ? totalRevenue : 0.0;

        // Autonomie solaire réelle
        double solarAutonomy = solarEnergyMetricRepository.findTopByOrderByTimestampDesc()
                .map(SolarEnergyMetric::getBatterySocPercent)
                .orElse(0.0);

        List<Map<String, Object>> revenueData = buildRevenueDistribution();

        // Indice de conversion alimentaire réel : kg d'aliment distribué par litre de lait collecté (30 derniers jours)
        LocalDate ratioStart = today.minusDays(29);
        double feedKg = feedDistributionRepository.findAll().stream()
                .filter(d -> d.getDistributionDate() != null
                        && !d.getDistributionDate().isBefore(ratioStart)
                        && !d.getDistributionDate().isAfter(today))
                .mapToDouble(d -> d.getQuantityDistributedKg() != null ? d.getQuantityDistributedKg() : 0.0)
                .sum();
        double milkLiters30d = milkProductionRepository
                .findByProductionDateBetweenOrderByProductionDateAsc(ratioStart, today).stream()
                .mapToDouble(m -> m.getVolumeLiters() != null ? m.getVolumeLiters() : 0.0)
                .sum();
        double feedRatio = milkLiters30d > 0 ? Math.round((feedKg / milkLiters30d) * 100.0) / 100.0 : 0.0;

        return DashboardStatsDTO.builder()
                .dailyMilkTotal(realDailyTotal)
                .morningMilkTotal(Math.round(morningSum * 10.0) / 10.0)
                .eveningMilkTotal(Math.round(eveningSum * 10.0) / 10.0)
                .milkingCowsCount((int) cowsMilkedCount)
                .totalFemalesCount((int) femalesCount)
                .totalBullsCount((int) bullsCount)
                .totalHerdCount(allAnimals.size())
                .averageMilkPerCow(avgPerCow)
                .healthAlertsCount((int) healthAlerts)
                .monthlyRevenueFcfa(monthlyRev)
                .feedConversionRatio(feedRatio)
                .solarAutonomyPercentage(solarAutonomy)
                .milkingCowsToday(milkingCows)
                .weeklyProductionChart(weeklyData)
                .revenueDistributionChart(revenueData)
                .build();
    }

    /**
     * Répartition réelle du chiffre d'affaires par famille de produit, calculée à partir
     * des lignes de facture enregistrées. Retourne une liste vide tant qu'aucune vente n'est saisie.
     */
    private List<Map<String, Object>> buildRevenueDistribution() {
        List<SaleInvoice> invoices = saleInvoiceRepository.findAll().stream()
                .filter(i -> i.getStatus() != InvoiceStatus.CANCELLED)
                .toList();

        Map<ProductType, Double> byType = new LinkedHashMap<>();
        double grandTotal = 0.0;
        for (SaleInvoice invoice : invoices) {
            if (invoice.getItems() == null) continue;
            for (InvoiceItem item : invoice.getItems()) {
                if (item.getProductType() == null) continue;
                double line = item.getLineTotalFcfa() != null ? item.getLineTotalFcfa() : 0.0;
                byType.merge(item.getProductType(), line, Double::sum);
                grandTotal += line;
            }
        }

        List<Map<String, Object>> distribution = new ArrayList<>();
        if (grandTotal <= 0) return distribution;

        for (Map.Entry<ProductType, Double> entry : byType.entrySet()) {
            Map<String, Object> slice = new HashMap<>();
            slice.put("name", productTypeLabel(entry.getKey()));
            slice.put("percent", Math.round(entry.getValue() / grandTotal * 1000.0) / 10.0);
            slice.put("amountFcfa", Math.round(entry.getValue() * 10.0) / 10.0);
            slice.put("color", productTypeColor(entry.getKey()));
            distribution.add(slice);
        }
        distribution.sort((a, b) -> Double.compare((Double) b.get("percent"), (Double) a.get("percent")));
        return distribution;
    }

    private String productTypeLabel(ProductType type) {
        return switch (type) {
            case CHEESE -> "Fromage Bio";
            case YOGURT -> "Yaourts Bio";
            case CURDLED_MILK -> "Lait Caillé (Sow)";
            case BUTTER -> "Beurre Fermier";
            case CREAM -> "Crème Fraîche";
            case PASTEURIZED_MILK -> "Lait Frais Bio";
            case RAW_MILK -> "Lait Cru (vente directe)";
        };
    }

    private String productTypeColor(ProductType type) {
        return switch (type) {
            case CHEESE -> "#f59e0b";
            case YOGURT -> "#9333ea";
            case CURDLED_MILK -> "#38bdf8";
            case BUTTER -> "#eab308";
            case CREAM -> "#f472b6";
            case PASTEURIZED_MILK -> "#16a34a";
            case RAW_MILK -> "#0ea5e9";
        };
    }
}
