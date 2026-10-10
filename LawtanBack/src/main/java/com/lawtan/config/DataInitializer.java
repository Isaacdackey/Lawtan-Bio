package com.lawtan.config;

import com.lawtan.entity.*;
import com.lawtan.model.*;
import com.lawtan.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final AnimalRepository animalRepository;
    private final HealthRecordRepository healthRecordRepository;
    private final ReproductionEventRepository reproductionEventRepository;
    private final RecipeRepository recipeRepository;
    private final AppUserRepository appUserRepository;
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE animals ALTER COLUMN image_url TYPE TEXT");
            jdbcTemplate.execute("ALTER TABLE animals ALTER COLUMN ear_tag_number DROP NOT NULL");
            jdbcTemplate.execute("ALTER TABLE animals DROP CONSTRAINT IF EXISTS animals_ear_tag_number_key");
            jdbcTemplate.execute("ALTER TABLE animals DROP CONSTRAINT IF EXISTS animals_category_check");
            jdbcTemplate.execute("ALTER TABLE animals DROP CONSTRAINT IF EXISTS animals_status_check");
            jdbcTemplate.execute("ALTER TABLE reproduction_events DROP CONSTRAINT IF EXISTS reproduction_events_event_type_check");
            jdbcTemplate.execute("ALTER TABLE reproduction_events DROP CONSTRAINT IF EXISTS reproduction_event_type_check");
            jdbcTemplate.execute("ALTER TABLE customers ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE");
            jdbcTemplate.execute("UPDATE customers SET active = TRUE WHERE active IS NULL");
            // Les enumerations evoluent (ajout de RAW_MILK) : Hibernate ne met pas a jour
            // les contraintes CHECK deja creees, on les retire pour ne pas bloquer les insertions.
            jdbcTemplate.execute(
                "DO $$ DECLARE r record; BEGIN " +
                "FOR r IN SELECT conname, conrelid::regclass AS tbl FROM pg_constraint " +
                "WHERE contype = 'c' AND pg_get_constraintdef(oid) ILIKE '%product_type%' LOOP " +
                "EXECUTE format('ALTER TABLE %s DROP CONSTRAINT %I', r.tbl, r.conname); END LOOP; END $$;");
            log.info("Colonnes et contraintes de validation PostgreSQL adaptées avec succès.");
        } catch (Exception e) {
            log.warn("Adaptation contraintes PostgreSQL: " + e.getMessage());
        }

        // 1. Amorçage strictement idempotent : aucune purge, aucune écrasement.
        //    Chaque bloc ne s'exécute que si sa table est vide, afin que toute saisie
        //    réalisée par les utilisateurs survive aux redémarrages de l'application.
        initRealHerd();
        initRealReproductionData();
        initRealHealthData();
        initOfficialRecipes();
        initAppUsers();
    }

    private void initOfficialRecipes() {
        if (recipeRepository.count() > 0) return;
        recipeRepository.saveAll(List.of(
            Recipe.builder()
                .code("REC-SOW-01")
                .name("Lait Caillé Traditionnel (Sow)")
                .productType(ProductType.CURDLED_MILK)
                .targetUnit("Litre")
                .milkLitersPerUnit(1.0)
                .ingredientsList("Lait cru entier bio, ferment traditionnel Sow Lawtan")
                .shelfLifeDays(14)
                .processInstructions("Ensemencement naturel au ferment Sow, fermentation lente en cuve 24h à 28°C.")
                .emoji("")
                .standardSellingPriceFcfa(1000.0)
                .build(),
            Recipe.builder()
                .code("REC-CH-01")
                .name("Fromage Fermier Frais des Niayes")
                .productType(ProductType.CHEESE)
                .targetUnit("pièce 200g")
                .milkLitersPerUnit(2.5)
                .ingredientsList("Lait Caillé (Sow) égoutté, sel marin bio, herbes aromatiques locales")
                .shelfLifeDays(21)
                .processInstructions("Prise de masse à partir de Lait Caillé (Sow), mise en faisselles perforées, égouttage lent 24h, salage manuel au sel marin.")
                .emoji("")
                .standardSellingPriceFcfa(2000.0)
                .build(),
            Recipe.builder()
                .code("REC-CH-02")
                .name("Fromage Blanc Artisanal")
                .productType(ProductType.CHEESE)
                .targetUnit("pot 250g")
                .milkLitersPerUnit(2.0)
                .ingredientsList("Lait Caillé (Sow) battu, pointe de crème fraîche fermière bio")
                .shelfLifeDays(15)
                .processInstructions("Égouttage partiel du caillé Sow, battage fin au fouet avec crème de lait, conditionnement frais.")
                .emoji("")
                .standardSellingPriceFcfa(1500.0)
                .build(),
            Recipe.builder()
                .code("REC-YG-01")
                .name("Yaourt Brassé Bio Nature")
                .productType(ProductType.YOGURT)
                .targetUnit("pot 125g")
                .milkLitersPerUnit(1.0)
                .ingredientsList("Lait cru bio pasteurisé, ferments lactiques vivants")
                .shelfLifeDays(28)
                .processInstructions("Pasteurisation douce 85°C, refroidissement 43°C, étuvage 8h puis brassage et refroidissement à 4°C.")
                .emoji("")
                .standardSellingPriceFcfa(500.0)
                .build(),
            Recipe.builder()
                .code("REC-MLK-01")
                .name("Lait Entier Pasteurisé Bio")
                .productType(ProductType.PASTEURIZED_MILK)
                .targetUnit("Bouteille 1L")
                .milkLitersPerUnit(1.0)
                .ingredientsList("100% Lait cru entier de traite bio certifié")
                .shelfLifeDays(7)
                .processInstructions("Pasteurisation flash 72°C pendant 15s, refroidissement direct à 3°C, embouteillage stérile.")
                .emoji("")
                .standardSellingPriceFcfa(1200.0)
                .build()
        ));
        log.info("5 recettes officielles de transformation enregistrées en base de données.");
    }

    private void initAppUsers() {
        if (appUserRepository.count() > 0) {
            log.info("Comptes utilisateurs déjà présents en base ({} comptes).", appUserRepository.count());
            return;
        }
        log.info("Création des comptes utilisateurs de la Ferme LAWTAN...");

        appUserRepository.saveAll(List.of(
            AppUser.builder()
                .email("amadou.sow@lawtan.sn")
                .password("Lawtan@2026")
                .name("M. Amadou Sow")
                .role("manager")
                .roleLabel("Directeur Général")
                .roleBadgeColor("#059669")
                .initials("AS")
                .title("Fondateur & Directeur d'Exploitation")
                .department("Direction Générale")
                .phone("+221 77 123 45 67")
                .build(),
            AppUser.builder()
                .email("dr.fall@lawtan.sn")
                .password("Veto@2026")
                .name("Dr. Cheikh Fall")
                .role("veto")
                .roleLabel("Vétérinaire Chef")
                .roleBadgeColor("#0284c7")
                .initials("CF")
                .title("Docteur Vétérinaire Référent")
                .department("Santé & Reproduction")
                .phone("+221 77 234 56 78")
                .build(),
            AppUser.builder()
                .email("moussa.diop@lawtan.sn")
                .password("Tech@2026")
                .name("Moussa Diop")
                .role("tech")
                .roleLabel("Technicien Élevage")
                .roleBadgeColor("#d97706")
                .initials("MD")
                .title("Responsable Traite & Transformation")
                .department("Production & Laiterie")
                .phone("+221 77 345 67 89")
                .build(),
            AppUser.builder()
                .email("fatou.ndiaye@lawtan.sn")
                .password("Compta@2026")
                .name("Fatou Kiné Ndiaye")
                .role("compta")
                .roleLabel("Comptable & Ventes")
                .roleBadgeColor("#7c3aed")
                .initials("FN")
                .title("Responsable Commerciale & Trésorerie")
                .department("Commercial & Finances")
                .phone("+221 77 456 78 90")
                .build(),
            AppUser.builder()
                .email("ibrahima.ba@lawtan.sn")
                .password("Bouvier@2026")
                .name("Ibrahima Ba")
                .role("bouvier")
                .roleLabel("Chef Bouvier")
                .roleBadgeColor("#16a34a")
                .initials("IB")
                .title("Superviseur Pâturages & Solaire")
                .department("Élevage & Énergie")
                .phone("+221 77 567 89 01")
                .build()
        ));
        log.info("✅ 5 comptes utilisateurs créés en base de données.");
    }

    private void initRealHerd() {
        if (animalRepository.count() > 0) {
            log.info("Cheptel déjà présent en base ({} animaux) : amorçage ignoré.", animalRepository.count());
            return;
        }
        // 1. H-1043
        Animal h1043 = Animal.builder()
                .internalId("H-1043")
                .name("Holstein 1043")
                .earTagNumber("H-1043")
                .rfidCode("RFID-1043-001")
                .breed("Holstein")
                .birthDate(LocalDate.of(2021, 1, 22))
                .gender("FEMALE")
                .category(AnimalCategory.VACHE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Vide (non gestante)")
                .reproStatusDetailed("Vide (non gestante)")
                .lactationStatus("En lactation")
                .daysOpen(169)
                .daysInMilk(169)
                .dailyMilkYield(0.99)
                .totalLactationMilk(603.0)
                .lactationNumber(2)
                .lastInseminationDate(LocalDate.of(2026, 2, 24))
                .arrivalDate(LocalDate.of(2023, 2, 1))
                .originLot("ANIPL 4")
                .origin("Import ANIPL 4 (Février 2023)")
                .descendantsCount(2)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐄")
                .notes("Arrivee Fevrier 2023 avec ANIPL 4. Velage le 17/09/2024. Mere de MORT-1043-2024 et H-0023.")
                .pedigree(Pedigree.builder().subjectNote("Vache Holstein Pure - Lignée haute productrice").build())
                .build();

        // 2. H-4835
        Animal h4835 = Animal.builder()
                .internalId("H-4835")
                .name("Holstein 4835")
                .earTagNumber("H-4835")
                .rfidCode("RFID-4835-002")
                .breed("Holstein")
                .birthDate(LocalDate.of(2021, 1, 22))
                .gender("FEMALE")
                .category(AnimalCategory.VACHE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Gestante (vêlage prévu 27/01/2027)")
                .reproStatusDetailed("Vide (non gestante)")
                .lactationStatus("En lactation")
                .daysInMilk(268)
                .dailyMilkYield(2.04)
                .totalLactationMilk(723.0)
                .lactationNumber(2)
                .lastInseminationDate(LocalDate.of(2026, 4, 14))
                .gestationDays(142)
                .expectedCalvingDate(LocalDate.of(2027, 1, 27))
                .expectedDryOffDate(LocalDate.of(2026, 11, 28))
                .arrivalDate(LocalDate.of(2023, 2, 1))
                .originLot("ANIPL 4")
                .origin("Import ANIPL 4 (Février 2023)")
                .descendantsCount(2)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐄")
                .notes("Arrivee Fevrier 2023 avec ANIPL 4. Velages le 07/01/2025 et 18/03/2026. Mere de HM-0034 et MORT-4835-2025.")
                .pedigree(Pedigree.builder().subjectNote("Vache Holstein Pure").build())
                .build();

        // 3. M-2713
        Animal m2713 = Animal.builder()
                .internalId("M-2713")
                .name("Montbeliarde 2713")
                .earTagNumber("M-2713")
                .rfidCode("RFID-2713-003")
                .breed("Montbeliarde")
                .birthDate(LocalDate.of(2019, 1, 22))
                .gender("FEMALE")
                .category(AnimalCategory.VACHE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Gestante (vêlage prévu 20/01/2027)")
                .reproStatusDetailed("Gestante")
                .lactationStatus("En lactation")
                .daysOpen(417)
                .daysInMilk(417)
                .dailyMilkYield(0.25)
                .totalLactationMilk(141.5)
                .lactationNumber(3)
                .lastInseminationDate(LocalDate.of(2026, 4, 14))
                .gestationDays(142)
                .expectedCalvingDate(LocalDate.of(2027, 1, 20))
                .arrivalDate(LocalDate.of(2021, 12, 1))
                .originLot("ANIPL 3")
                .origin("Import ANIPL 3 (Décembre 2021)")
                .descendantsCount(3)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐄")
                .notes("Arrivee Decembre 2021 avec ANIPL 3. Matriarche Montbéliarde. Mere de M-0022, MH-0028, MH-0031.")
                .pedigree(Pedigree.builder().subjectNote("Matriarche Montbéliarde de la ferme").build())
                .build();

        // 4. M-8326
        Animal m8326 = Animal.builder()
                .internalId("M-8326")
                .name("Montbeliarde 8326")
                .earTagNumber("M-8326")
                .rfidCode("RFID-8326-004")
                .breed("Montbeliarde")
                .birthDate(LocalDate.of(2021, 1, 22))
                .gender("FEMALE")
                .category(AnimalCategory.VACHE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Vide - Réforme recommandée (417j ouverts)")
                .reproStatusDetailed("Vide (non gestante)")
                .lactationStatus("Tarie")
                .daysOpen(417)
                .daysInMilk(417)
                .dailyMilkYield(0.61)
                .totalLactationMilk(253.0)
                .lactationNumber(1)
                .lastInseminationDate(LocalDate.of(2026, 2, 24))
                .arrivalDate(LocalDate.of(2023, 2, 1))
                .originLot("ANIPL 4")
                .origin("Import ANIPL 4 (Février 2023)")
                .descendantsCount(1)
                .cullingRecommended(true)
                .cowMasterAlert("Days Open: 417, calving interval issue, consider culling from the herd")
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐄")
                .notes("Arrivee Fevrier 2023 avec ANIPL 4. Alerte reforme 417 jours ouverts sans gestation. Mere de M-0030.")
                .pedigree(Pedigree.builder().subjectNote("Vache Montbéliarde (Mère de M-0030)").build())
                .build();

        // 5. J-9163
        Animal j9163 = Animal.builder()
                .internalId("J-9163")
                .name("Jersiaise 9163")
                .earTagNumber("J-9163")
                .rfidCode("RFID-9163-005")
                .breed("Jersiaise")
                .birthDate(LocalDate.of(2019, 1, 22))
                .gender("FEMALE")
                .category(AnimalCategory.VACHE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Gestante")
                .reproStatusDetailed("Gestante")
                .lactationStatus("En lactation")
                .daysOpen(176)
                .daysInMilk(176)
                .dailyMilkYield(0.50)
                .totalLactationMilk(304.5)
                .lactationNumber(2)
                .lastInseminationDate(LocalDate.of(2026, 4, 14))
                .arrivalDate(LocalDate.of(2021, 12, 1))
                .originLot("ANIPL 3")
                .origin("Import ANIPL 3 (Décembre 2021)")
                .descendantsCount(2)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐄")
                .notes("Arrivee Decembre 2021 avec ANIPL 3. Matriarche Jersiaise. Mere de J-0766 et JM-0029.")
                .pedigree(Pedigree.builder().subjectNote("Matriarche Jersiaise Pure (Mère de J-0766)").build())
                .build();

        // 6. J-0766
        Animal j0766 = Animal.builder()
                .internalId("J-0766")
                .name("Jersiaise 0766 - Ex 021")
                .earTagNumber("J-0766")
                .rfidCode("RFID-0766-006")
                .breed("Jersiaise")
                .birthDate(LocalDate.of(2022, 3, 12))
                .gender("FEMALE")
                .category(AnimalCategory.VACHE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Vide (non gestante)")
                .reproStatusDetailed("Vide (non gestante)")
                .lactationStatus("En lactation")
                .daysOpen(236)
                .daysInMilk(236)
                .dailyMilkYield(0.0)
                .totalLactationMilk(0.0)
                .lactationNumber(2)
                .lastInseminationDate(LocalDate.of(2025, 6, 15))
                .motherId("J-9163")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(1)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐄")
                .notes("Nee a la Ferme Lawtan. Deux velages enregistres (05/12/2023 et 11/03/2026). Mere de JM-0033. Bug de rattachement CowMaster resolu.")
                .pedigree(Pedigree.builder().subjectNote("Vache Jersiaise 1ère Génération née à la Ferme").motherName("Jersiaise 9163 (J-9163)").build())
                .build();

        // 7. JH-0027
        Animal jh0027 = Animal.builder()
                .internalId("JH-0027")
                .name("Jersiaise-Holstein 027")
                .earTagNumber("JH-0027")
                .rfidCode("RFID-0027-007")
                .breed("Croise Jersiaise/Holstein")
                .birthDate(LocalDate.of(2023, 12, 5))
                .gender("FEMALE")
                .category(AnimalCategory.VACHE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Gestation a confirmer (J+46)")
                .reproStatusDetailed("Vide (non gestante)")
                .lactationStatus("En lactation")
                .daysOpen(394)
                .daysInMilk(236)
                .dailyMilkYield(0.0)
                .totalLactationMilk(0.0)
                .lactationNumber(1)
                .lastInseminationDate(LocalDate.of(2026, 7, 20))
                .gestationDays(45)
                .expectedCalvingDate(LocalDate.of(2027, 4, 30))
                .expectedDryOffDate(LocalDate.of(2027, 3, 1))
                .motherId("J-0021")
                .fatherDescription("Holstein blanc_Ne de 1647-16 juil 2019")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(1)
                .cowMasterAlert("(46.day) Make a Pregnancy Test to confirm pregnancy")
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐄")
                .notes("Metisse Jersiaise - Holstein. Mere : J-0021, Pere : Holstein blanc ne de 1647. Mere de JHM-0032.")
                .pedigree(Pedigree.builder().subjectNote("Génisse croisée Jersiaise x Holstein").motherName("J-0021").fatherName("Holstein blanc né de 1647").build())
                .build();

        // 8. G-001
        Animal g001 = Animal.builder()
                .internalId("G-001")
                .name("Gobra 001")
                .earTagNumber("G-001")
                .rfidCode("RFID-0001-008")
                .breed("Gobra")
                .birthDate(LocalDate.of(2021, 11, 17))
                .gender("FEMALE")
                .category(AnimalCategory.VACHE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Gestante (a confirmer - J+49)")
                .reproStatusDetailed("Gestante (a confirmer)")
                .lactationStatus("Tarie")
                .daysInMilk(135)
                .dailyMilkYield(0.01)
                .totalLactationMilk(2.0)
                .lactationNumber(1)
                .lastInseminationDate(LocalDate.of(2026, 7, 17))
                .gestationDays(48)
                .expectedCalvingDate(LocalDate.of(2027, 4, 26))
                .fatherId("M-0022")
                .originLot("Vache de Colley")
                .origin("Vache de Colley (Pout)")
                .descendantsCount(2)
                .cowMasterAlert("(49.day) Make a Pregnancy Test to confirm pregnancy")
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐄")
                .notes("Vache de Colley recuperee a Pout avec velle G-002. Mere de G-002 et G-003.")
                .pedigree(Pedigree.builder().subjectNote("Vache locale Gobra sélectionnée").fatherName("Montbeliard 022 (M-0022)").build())
                .build();

        // 9. G-002
        Animal g002 = Animal.builder()
                .internalId("G-002")
                .name("Gobra 002")
                .earTagNumber("G-002")
                .rfidCode("RFID-0002-009")
                .breed("Gobra")
                .birthDate(LocalDate.of(2023, 9, 15))
                .gender("FEMALE")
                .category(AnimalCategory.GENISSE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Gestante (a confirmer)")
                .reproStatusDetailed("Gestante (a confirmer)")
                .lactationStatus("Vide")
                .lastInseminationDate(LocalDate.of(2026, 7, 17))
                .motherId("G-001")
                .fatherId("M-0022")
                .originLot("Vache de Colley")
                .origin("Vache de Colley")
                .descendantsCount(0)
                .cowMasterAlert("Missing Events: please add insemination, calving records!")
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐮")
                .notes("Velle de G-001. Genisse gestante a confirmer.")
                .pedigree(Pedigree.builder().subjectNote("Génisse Gobra issue de G-001").motherName("Gobra 001 (G-001)").fatherName("Montbeliard 022 (M-0022)").build())
                .build();

        // 10. G-004
        Animal g004 = Animal.builder()
                .internalId("G-004")
                .name("Gobra 004")
                .earTagNumber("G-004")
                .rfidCode("RFID-0004-010")
                .breed("Gobra")
                .birthDate(LocalDate.of(2023, 5, 15))
                .gender("FEMALE")
                .category(AnimalCategory.GENISSE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Vide (non gestante)")
                .reproStatusDetailed("Vide (non gestante)")
                .lactationStatus("Vide")
                .originLot("Vache de Colley")
                .origin("Vache de Colley recuperee a Pout")
                .descendantsCount(0)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐮")
                .notes("Vache de Colley recuperee a Pout.")
                .pedigree(Pedigree.builder().subjectNote("Génisse Gobra pure issue du cheptel de Colley").build())
                .build();

        // 11. M-0022
        Animal m0022 = Animal.builder()
                .internalId("M-0022")
                .name("Montbeliard 022")
                .earTagNumber("M-0022")
                .rfidCode("RFID-0022-011")
                .breed("Montbeliarde")
                .birthDate(LocalDate.of(2022, 3, 14))
                .gender("MALE")
                .category(AnimalCategory.TAUREAU)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Reproducteur Principal Actif")
                .motherId("M-2713")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(4)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐂")
                .notes("Reproducteur principal du troupeau. Pere de G-002, JHM-0032, JM-0033. Saillies directes performantes.")
                .pedigree(Pedigree.builder().subjectNote("Taureau Reproducteur Principal - Montbéliard Pure").motherName("Montbeliarde 2713 (M-2713)").semenMobilityPercentage(88.0).semenConcentration(1.4).semenMorphologyOkPercentage(92.0).semenDosesAvailable(24).build())
                .build();

        // 12. H-0023
        Animal h0023 = Animal.builder()
                .internalId("H-0023")
                .name("Holstein 023")
                .earTagNumber("H-0023")
                .rfidCode("RFID-0023-012")
                .breed("Holstein")
                .birthDate(LocalDate.of(2023, 3, 23))
                .gender("MALE")
                .category(AnimalCategory.TAUREAU)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Taureau Reproducteur")
                .motherId("H-1043")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(1)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐂")
                .notes("Ne a la Ferme Lawtan. Utilise comme reproducteur (M-2713, pere de MH-0031).")
                .pedigree(Pedigree.builder().subjectNote("Taureau Holstein Pure - Lignée élite").motherName("Holstein 1043 (H-1043)").semenMobilityPercentage(85.0).semenConcentration(1.2).semenMorphologyOkPercentage(90.0).semenDosesAvailable(16).build())
                .build();

        // 13. G-003
        Animal g003 = Animal.builder()
                .internalId("G-003")
                .name("Gobra 003")
                .earTagNumber("G-003")
                .rfidCode("RFID-0003-013")
                .breed("Gobra")
                .birthDate(LocalDate.of(2025, 8, 5))
                .gender("MALE")
                .category(AnimalCategory.JEUNE_MALE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Jeune mâle en croissance")
                .motherId("G-001")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(0)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐂")
                .notes("Veau de G-001. Pere inconnu.")
                .pedigree(Pedigree.builder().subjectNote("Jeune taillon Gobra né à la ferme").motherName("Gobra 001 (G-001)").build())
                .build();

        // 14. MH-0028
        Animal mh0028 = Animal.builder()
                .internalId("MH-0028")
                .name("Montbeliard-Holstein 028")
                .earTagNumber("MH-0028")
                .rfidCode("RFID-0028-014")
                .breed("Mont-Holstein")
                .birthDate(LocalDate.of(2024, 5, 25))
                .gender("MALE")
                .category(AnimalCategory.JEUNE_MALE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Jeune mâle")
                .motherId("M-2713")
                .fatherDescription("Holstein blanc ne de 1647_ANIPL 02")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(0)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐂")
                .notes("Ne a la Ferme Lawtan. Mere: M-2713, Pere: Holstein blanc ne de 1647.")
                .pedigree(Pedigree.builder().subjectNote("Jeune mâle issu de croisement Montbéliarde x Holstein").motherName("Montbeliarde 2713 (M-2713)").fatherName("Holstein blanc né de 1647").build())
                .build();

        // 15. MH-0031
        Animal mh0031 = Animal.builder()
                .internalId("MH-0031")
                .name("Montbeliard/Holstein MH 031")
                .earTagNumber("MH-0031")
                .rfidCode("RFID-0031-015")
                .breed("Croise Montbeliard/Holstein")
                .birthDate(LocalDate.of(2025, 12, 9))
                .gender("MALE")
                .category(AnimalCategory.VEAU)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Veau mâle")
                .motherId("M-2713")
                .fatherId("H-0023")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(0)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐮")
                .notes("Naissance normale sans assistance. Note de velage CowMaster mentionnait MH-030.")
                .pedigree(Pedigree.builder().subjectNote("Veau mâle croisé Montbéliarde x Holstein").motherName("Montbeliarde 2713 (M-2713)").fatherName("Holstein 023 (H-0023)").build())
                .build();

        // 16. M-0030
        Animal m0030 = Animal.builder()
                .internalId("M-0030")
                .name("Montbeliarde 030")
                .earTagNumber("M-0030")
                .rfidCode("RFID-0030-016")
                .breed("Montbeliard")
                .birthDate(LocalDate.of(2025, 7, 13))
                .gender("FEMALE")
                .category(AnimalCategory.VELLE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Velle en élevage")
                .motherId("M-8326")
                .fatherDescription("Fallou Inseminateur")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(0)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐮")
                .notes("Naissance normale. Insemination par Fallou le 15 octobre 2024. Mere: M-8326.")
                .pedigree(Pedigree.builder().subjectNote("Velle Montbéliarde issue d'IA Fallou").motherName("Montbeliarde 8326 (M-8326)").fatherName("Semence Montbéliarde (Fallou)").build())
                .build();

        // 17. JHM-0032
        Animal jhm0032 = Animal.builder()
                .internalId("JHM-0032")
                .name("JHMontbeliarde JHM 032")
                .earTagNumber("JHM-0032")
                .rfidCode("RFID-0032-017")
                .breed("Croise JH et Montbeliard")
                .birthDate(LocalDate.of(2026, 1, 10))
                .gender("FEMALE")
                .category(AnimalCategory.VELLE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Velle en élevage")
                .motherId("JH-0027")
                .fatherId("M-0022")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(0)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐮")
                .notes("Croise. Mere : croise Jersiaise-Holstein (JH-0027). Pere : Montbeliard (M-0022). Velage difficile avec assistance chirurgicale de Mme SARR et Moussa.")
                .pedigree(Pedigree.builder().subjectNote("Velle triple croisement JH x Montbéliarde").motherName("Jersiaise-Holstein 027 (JH-0027)").fatherName("Montbeliard 022 (M-0022)").build())
                .build();

        // 18. JM-0033
        Animal jm0033 = Animal.builder()
                .internalId("JM-0033")
                .name("Jersiaise Montbeliarde JM 033")
                .earTagNumber("JM-0033")
                .rfidCode("RFID-0033-018")
                .breed("Croise Jersiaise/Montbeliard")
                .birthDate(LocalDate.of(2026, 3, 11))
                .gender("FEMALE")
                .category(AnimalCategory.VELLE)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Velle en élevage")
                .motherId("J-0766")
                .fatherId("M-0022")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(0)
                .sourceRecord("Fiche complete")
                .avatarEmoji("🐮")
                .notes("Nee a la Ferme Lawtan. Mere: J-0766, Pere: M-0022.")
                .pedigree(Pedigree.builder().subjectNote("Velle croisée Jersiaise x Montbéliarde").motherName("Jersiaise 0766 (J-0766)").fatherName("Montbeliard 022 (M-0022)").build())
                .build();

        // 19. HM-0034
        Animal hm0034 = Animal.builder()
                .internalId("HM-0034")
                .name("Holstein-Montbeliarde HM 034")
                .earTagNumber("HM-0034")
                .rfidCode("RFID-0034-019")
                .breed("Holstein-Montbeliarde")
                .birthDate(LocalDate.of(2026, 3, 18))
                .gender("FEMALE")
                .category(AnimalCategory.VEAU)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Veau")
                .motherId("H-4835")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(0)
                .sourceRecord("Deduit (liste veaux H-4835)")
                .avatarEmoji("🐮")
                .notes("Date de naissance non affichee dans CowMaster ; velage de la mere H-4835 le 18/03/2026.")
                .pedigree(Pedigree.builder().subjectNote("Veau femelle issue de H-4835").motherName("Holstein 4835 (H-4835)").build())
                .build();

        // 20. JM-0029
        Animal jm0029 = Animal.builder()
                .internalId("JM-0029")
                .name("Jers-Montbliard 029")
                .earTagNumber("JM-0029")
                .rfidCode("RFID-0029-020")
                .breed("Jersiaise-Montbeliard")
                .birthDate(LocalDate.of(2024, 10, 30))
                .gender("FEMALE")
                .category(AnimalCategory.VEAU)
                .status(AnimalStatus.ACTIF)
                .reproStatus("Veau")
                .motherId("J-9163")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(0)
                .sourceRecord("Deduit (liste veaux J-9163)")
                .avatarEmoji("🐮")
                .notes("Date de naissance non affichee dans CowMaster. Issue de J-9163.")
                .pedigree(Pedigree.builder().subjectNote("Veau femelle issue de J-9163").motherName("Jersiaise 9163 (J-9163)").build())
                .build();

        // 21. MORT-1043-2024
        Animal mort1043 = Animal.builder()
                .internalId("MORT-1043-2024")
                .name("Morte / Morte Nee")
                .earTagNumber("MORT-1043-2024")
                .breed("Holstein")
                .birthDate(LocalDate.of(2024, 9, 17))
                .deathDate(LocalDate.of(2024, 9, 20))
                .gender("FEMALE")
                .category(AnimalCategory.VEAU)
                .status(AnimalStatus.MORT_NE)
                .reproStatus("Mort-né")
                .motherId("H-1043")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(0)
                .sourceRecord("Deduit (liste veaux H-1043)")
                .avatarEmoji("🕊️")
                .notes("Deux mort-nes n'ont pas de boucle. IDs provisoires MORT-1043-2024 crees pour ne pas perdre la ligne. Velage de la mere le 17/09/2024.")
                .build();

        // 22. MORT-4835-2025
        Animal mort4835 = Animal.builder()
                .internalId("MORT-4835-2025")
                .name("Morte 2 / Morte nee 2")
                .earTagNumber("MORT-4835-2025")
                .breed("Holstein")
                .birthDate(LocalDate.of(2025, 1, 7))
                .deathDate(LocalDate.of(2025, 1, 8))
                .gender("FEMALE")
                .category(AnimalCategory.VEAU)
                .status(AnimalStatus.MORT_NE)
                .reproStatus("Mort-né")
                .motherId("H-4835")
                .originLot("Naissance ferme")
                .origin("Ferme Lawtan")
                .descendantsCount(0)
                .sourceRecord("Deduit (liste veaux H-4835)")
                .avatarEmoji("🕊️")
                .notes("Deux mort-nes n'ont pas de boucle. ID provisoire MORT-4835-2025. Velage de la mere le 07/01/2025.")
                .build();

        // 23. J-0021
        Animal j0021 = Animal.builder()
                .internalId("J-0021")
                .name("Jersiaise 021")
                .earTagNumber("J-0021")
                .breed("Jersiaise")
                .birthDate(LocalDate.of(2020, 1, 1))
                .gender("FEMALE")
                .category(AnimalCategory.VACHE)
                .status(AnimalStatus.A_VERIFIER)
                .reproStatus("Fiche d'archive historique")
                .originLot("Historique Troupeau")
                .origin("Ferme Lawtan")
                .descendantsCount(1)
                .sourceRecord("Reference seule (mere de JH-0027)")
                .avatarEmoji("📁")
                .notes("Mere de JH-0027, jamais fournie dans CowMaster. Animal sorti du troupeau ou fiche archive a creer.")
                .build();

        List<Animal> realHerd = List.of(
                h1043, h4835, m2713, m8326, j9163, j0766, jh0027,
                g001, g002, g004, m0022, h0023, g003, mh0028,
                mh0031, m0030, jhm0032, jm0033, hm0034, jm0029,
                mort1043, mort4835, j0021
        );

        for (Animal a : realHerd) {
            if (a.getPedigree() != null) {
                a.getPedigree().setAnimal(a);
            }
        }

        animalRepository.saveAll(realHerd);
        log.info("23 animaux réels CowMaster enregistrés avec succès.");
    }

    private void initRealReproductionData() {
        if (reproductionEventRepository.count() > 0) return;
        Map<String, Animal> map = animalRepository.findAll().stream()
                .collect(Collectors.toMap(Animal::getInternalId, a -> a));

        List<ReproductionEvent> events = List.of(
            // H-1043 (7 événements)
            ReproductionEvent.builder().animal(map.get("H-1043")).eventDate(LocalDate.of(2026, 4, 28)).eventTime("12:29").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Negatif").observations("Contrôle gestation négatif. Aucune réussite de toutes les inséminations de Fallou.").isConfirmed(false).build(),
            ReproductionEvent.builder().animal(map.get("H-1043")).eventDate(LocalDate.of(2026, 2, 24)).eventTime("10:30").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").operatorName("Fallou Inseminateur").bullOrSemenUsed("Semence sexée Femelle Montbéliarde").method("Semence sexee").observations("Semence sexee Femelle Montbeliarde").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("H-1043")).eventDate(LocalDate.of(2026, 2, 15)).eventTime("16:55").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Negatif").observations("Diagnostic négatif").isConfirmed(false).build(),
            ReproductionEvent.builder().animal(map.get("H-1043")).eventDate(LocalDate.of(2025, 10, 13)).eventTime("17:54").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Positif").observations("Diagnostic positif initial").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("H-1043")).eventDate(LocalDate.of(2025, 9, 1)).eventTime("14:50").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").operatorName("Fallou Mbacke").bullOrSemenUsed("Fallou - Normande").method("Semence sexee").observations("Fallou Mbacke : Semence sexee -> Femelle Normande (Libellé app: Fallou - Normande)").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("H-1043")).eventDate(LocalDate.of(2025, 1, 7)).eventTime("14:50").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").method("Semence sexee").observations("Insemination sexee femelle").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("H-1043")).eventDate(LocalDate.of(2024, 9, 17)).eventTime("13:54").eventType(ReproEventType.CALVING).cowMasterTypeOriginal("Gives Birth").result("Confirme").observations("Naissance normale (Veau MORT-1043-2024)").isConfirmed(true).build(),

            // H-4835 (4 événements)
            ReproductionEvent.builder().animal(map.get("H-4835")).eventDate(LocalDate.of(2026, 3, 18)).eventTime("17:05").eventType(ReproEventType.CALVING).cowMasterTypeOriginal("Gives Birth").result("Confirme").observations("Vêlage confirmé. Veau: HM-0034").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("H-4835")).eventDate(LocalDate.of(2025, 12, 27)).eventTime("13:00").eventType(ReproEventType.DRY_OFF).cowMasterTypeOriginal("Dry-Off").observations("Mme SARR decide : -> Arret de traire H-4835").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("H-4835")).eventDate(LocalDate.of(2025, 6, 15)).eventTime("15:32").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").bullOrSemenUsed("Montbeliard 022 (M-0022)").method("Saillie directe").observations("Saillie directe par M-0022 (Libellé app: Montbeliard 022, 0022)").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("H-4835")).eventDate(LocalDate.of(2025, 1, 7)).eventTime("14:11").eventType(ReproEventType.CALVING).cowMasterTypeOriginal("Gives Birth").result("Confirme").observations("NB : Saillie directe préalable par H-0023. Veau MORT-4835-2025").isConfirmed(true).build(),

            // M-2713 (4 événements)
            ReproductionEvent.builder().animal(map.get("M-2713")).eventDate(LocalDate.of(2026, 8, 31)).eventTime("16:15").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Positif").observations("Gestation confirmée positive").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("M-2713")).eventDate(LocalDate.of(2026, 6, 12)).eventTime("08:58").eventType(ReproEventType.ILLNESS_TREATMENT).cowMasterTypeOriginal("Illness / Treatment").pathology("Mammite").treatment("Tridex").observations("Traitement de mammite avec antibiotique Tridex").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("M-2713")).eventDate(LocalDate.of(2026, 4, 14)).eventTime("17:51").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").bullOrSemenUsed("Holstein 023 (H-0023)").method("Saillie directe").expectedCalvingDate(LocalDate.of(2027, 1, 20)).observations("Saillie directe par H-023").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("M-2713")).eventDate(LocalDate.of(2025, 12, 9)).eventTime("05:55").eventType(ReproEventType.CALVING).cowMasterTypeOriginal("Gives Birth").result("Confirme").observations("Naissance veau croise Montbeliard/Holstein -> note MH-030, veau enregistre MH-0031").isConfirmed(true).build(),

            // M-8326 (4 événements)
            ReproductionEvent.builder().animal(map.get("M-8326")).eventDate(LocalDate.of(2026, 4, 28)).eventTime("12:31").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Negatif").observations("Diagnostic négatif. Aucune réussite de toutes les inséminations de Fallou ! Réforme recommandée.").isConfirmed(false).build(),
            ReproductionEvent.builder().animal(map.get("M-8326")).eventDate(LocalDate.of(2026, 2, 24)).eventTime("10:35").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").operatorName("Fallou Inseminateur").bullOrSemenUsed("Semence sexée Femelle Montbéliarde").method("Semence sexee").observations("Semence sexee Femelle Montbeliarde").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("M-8326")).eventDate(LocalDate.of(2026, 2, 15)).eventTime("16:56").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Negatif").observations("Diagnostic négatif").isConfirmed(false).build(),
            ReproductionEvent.builder().animal(map.get("M-8326")).eventDate(LocalDate.of(2025, 10, 28)).eventTime("11:10").eventType(ReproEventType.ILLNESS_TREATMENT).cowMasterTypeOriginal("Illness / Treatment").pathology("Tripanosomose").treatment("Deparasitant sanguin, Anti-inflammatoire, Antibiotique, vitamine").observations("Examen complémentaire : hémoparasitose confirmée").isConfirmed(true).build(),

            // J-9163 (4 événements)
            ReproductionEvent.builder().animal(map.get("J-9163")).eventDate(LocalDate.of(2026, 8, 31)).eventTime("16:13").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Positif").observations("Gestation confirmée positive. NB : Saillie directe préalable par M-0022.").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("J-9163")).eventDate(LocalDate.of(2026, 4, 14)).eventTime("17:53").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").bullOrSemenUsed("Montbeliard 022 (M-0022)").method("Saillie directe").observations("Saillie directe par M-022").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("J-9163")).eventDate(LocalDate.of(2026, 2, 24)).eventTime("10:40").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").operatorName("Fallou Inseminateur").bullOrSemenUsed("Semence sexée Femelle Montbéliarde").method("Semence sexee").observations("Semence sexee Femelle Montbeliarde").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("J-9163")).eventDate(LocalDate.of(2026, 2, 1)).eventTime("09:21").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Negatif").observations("Diagnostic négatif").isConfirmed(false).build(),

            // J-0766 (4 événements)
            ReproductionEvent.builder().animal(map.get("J-0766")).eventDate(LocalDate.of(2026, 3, 11)).eventTime("18:00").eventType(ReproEventType.CALVING).cowMasterTypeOriginal("Gives Birth").result("Confirme").observations("Naissance normale sans assistance. Veau : JM-0033 (née le 11/03/2026).").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("J-0766")).eventDate(LocalDate.of(2025, 6, 15)).eventTime("14:46").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").bullOrSemenUsed("Montbeliard 022 (M-0022)").method("Saillie directe").observations("Saillie directe M-0022").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("J-0766")).eventDate(LocalDate.of(2024, 12, 26)).eventTime("14:54").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").operatorName("Dr Fallou").bullOrSemenUsed("Semence sexée femelle").method("Semence sexee").observations("Insemination sexee femelle").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("J-0766")).eventDate(LocalDate.of(2023, 12, 5)).eventTime("14:14").eventType(ReproEventType.CALVING).cowMasterTypeOriginal("Gives Birth").result("Confirme").observations("Premier vêlage réussi").isConfirmed(true).build(),

            // JH-0027 (2 événements)
            ReproductionEvent.builder().animal(map.get("JH-0027")).eventDate(LocalDate.of(2026, 1, 10)).eventTime("09:00").eventType(ReproEventType.CALVING).cowMasterTypeOriginal("Gives Birth").result("Difficile").observations("Velage difficile. Assistance de Moussa. Intervention chirurgicale de Mme SARR. Veau : JHM-0032.").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("JH-0027")).eventDate(LocalDate.of(2025, 4, 3)).eventTime("14:35").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").bullOrSemenUsed("Montbeliard 022 (M-0022)").method("Saillie directe").observations("Saillie directe par M-0022").isConfirmed(true).build(),

            // G-001 (5 événements)
            ReproductionEvent.builder().animal(map.get("G-001")).eventDate(LocalDate.of(2026, 7, 20)).eventTime("11:04").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").bullOrSemenUsed("Montbeliard 022 (M-0022)").method("Saillie directe").observations("Saillie directe suite observation chaleur naturelle.").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("G-001")).eventDate(LocalDate.of(2026, 4, 28)).eventTime("12:33").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Negatif").observations("Aucune reussite de toutes les inseminations de Fallou !").isConfirmed(false).build(),
            ReproductionEvent.builder().animal(map.get("G-001")).eventDate(LocalDate.of(2026, 2, 24)).eventTime("10:45").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").operatorName("Fallou Inseminateur").bullOrSemenUsed("Semence sexée Femelle Montbéliarde").method("Semence sexee").observations("Semence sexee Femelle Montbeliarde").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("G-001")).eventDate(LocalDate.of(2025, 12, 18)).eventTime("17:46").eventType(ReproEventType.DRY_OFF).cowMasterTypeOriginal("Dry-Off").observations("Mise au tarissement").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("G-001")).eventDate(LocalDate.of(2025, 8, 5)).eventTime("17:30").eventType(ReproEventType.CALVING).cowMasterTypeOriginal("Gives Birth").result("Confirme").observations("Vêlage confirmé. Veau: G-003").isConfirmed(true).build(),

            // G-002 (6 événements)
            ReproductionEvent.builder().animal(map.get("G-002")).eventDate(LocalDate.of(2026, 7, 17)).eventTime("20:00").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").bullOrSemenUsed("Montbeliard 022 (M-0022)").method("Saillie directe").observations("Saillie directe suite observation chaleur.").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("G-002")).eventDate(LocalDate.of(2026, 4, 28)).eventTime("12:34").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Negatif").observations("Aucune reussite de toutes les inseminations de Fallou !").isConfirmed(false).build(),
            ReproductionEvent.builder().animal(map.get("G-002")).eventDate(LocalDate.of(2026, 2, 24)).eventTime("10:50").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").operatorName("Fallou Inseminateur").bullOrSemenUsed("Semence sexée Femelle Montbéliarde").method("Semence sexee").observations("Semence sexee Femelle Montbeliarde").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("G-002")).eventDate(LocalDate.of(2025, 10, 11)).eventTime("14:17").eventType(ReproEventType.PREG_CHECK).cowMasterTypeOriginal("Preg Check").result("Negatif").observations("Diagnostic échographique négatif").isConfirmed(false).build(),
            ReproductionEvent.builder().animal(map.get("G-002")).eventDate(LocalDate.of(2025, 9, 21)).eventTime("09:02").eventType(ReproEventType.HEAT_DETECTION).cowMasterTypeOriginal("Heat Period").observations("Chaleur malgre insemination le 01/09/25 -> Saillie directe").isConfirmed(true).build(),
            ReproductionEvent.builder().animal(map.get("G-002")).eventDate(LocalDate.of(2025, 9, 1)).eventTime("14:20").eventType(ReproEventType.INSEMINATION).cowMasterTypeOriginal("Inseminated").operatorName("Fallou Mbacke").bullOrSemenUsed("Fallou -> Normande").method("Semence sexee").observations("Fallou Mbacke -> Semence sexee Femelle Normande").isConfirmed(true).build()
        );

        reproductionEventRepository.saveAll(events.stream().filter(e -> e.getAnimal() != null).toList());
        log.info("{} événements réels de reproduction CowMaster insérés avec succès.", events.size());
    }

    private void initRealHealthData() {
        if (healthRecordRepository.count() > 0) return;
        Animal m2713 = animalRepository.findByInternalId("M-2713").orElse(null);
        Animal m8326 = animalRepository.findByInternalId("M-8326").orElse(null);

        List<HealthRecord> records = List.of(
                // 1. Épisode réel CowMaster : Mammite clinique sur M-2713 (12/06/2026)
                HealthRecord.builder()
                        .animal(m2713)
                        .recordDate(LocalDate.of(2026, 6, 12))
                        .actType("Pathologie Mammaire")
                        .diagnosis("Mammite clinique aiguë - Quartier postérieur gauche enflammé")
                        .treatmentPrescription("Tridex (antibiotique intramammaire)")
                        .practitionerName("Dr. Fall / Mme Sarr")
                        .costFcfa(15000.0)
                        .status("Clôturé")
                        .milkWithdrawalDays(3)
                        .build(),

                // 2. Épisode réel CowMaster : Tripanosomose sur M-8326 (28/10/2025)
                HealthRecord.builder()
                        .animal(m8326)
                        .recordDate(LocalDate.of(2025, 10, 28))
                        .actType("Maladie Parasitaire")
                        .diagnosis("Tripanosomose bovine (confirmation hémoparasitose)")
                        .treatmentPrescription("Déparasitant sanguin, Anti-inflammatoire, Antibiotique, Complexe vitaminique")
                        .practitionerName("Dr. Fall")
                        .costFcfa(22500.0)
                        .status("Clôturé")
                        .milkWithdrawalDays(5)
                        .build()
        );
        healthRecordRepository.saveAll(records.stream().filter(r -> r.getAnimal() != null).toList());
        log.info("Données de santé clinique officielles CowMaster (2 épisodes réels) insérées avec succès.");
    }
}
