package com.lawtan.util;

import com.lawtan.exception.BusinessException;
import org.springframework.http.HttpStatus;

import java.util.regex.Pattern;

public class PhoneUtils {

    private static final Pattern SENEGAL_DIGITS_PATTERN = Pattern.compile("^(70|75|76|77|78|33)\\d{7}$");

    /**
     * Valide et normalise un numéro de téléphone sénégalais en format standard :
     * "+221 XX XXX XX XX".
     *
     * @param raw Le numéro brut saisi par l'utilisateur.
     * @param required Si vrai, une valeur vide ou nulle déclenche une erreur.
     * @return Le numéro normalisé ou null si non requis et vide.
     */
    public static String normalizeSenegalPhone(String raw, boolean required) {
        if (raw == null || raw.trim().isEmpty()) {
            if (required) {
                throw new BusinessException("Le numéro de téléphone est obligatoire.", HttpStatus.BAD_REQUEST);
            }
            return null;
        }

        String cleaned = raw.trim();
        // Remplacer 00221 par +221 au début
        if (cleaned.startsWith("00221")) {
            cleaned = "+221" + cleaned.substring(5);
        }

        // Extraire uniquement les chiffres
        String digitsOnly = cleaned.replaceAll("[^0-9]", "");

        // Si commence par l'indicatif 221 et fait 12 chiffres
        if (digitsOnly.startsWith("221") && digitsOnly.length() == 12) {
            digitsOnly = digitsOnly.substring(3);
        }

        if (!SENEGAL_DIGITS_PATTERN.matcher(digitsOnly).matches()) {
            throw new BusinessException(
                    "Numéro de téléphone invalide : '" + raw + "'. Veuillez renseigner un numéro sénégalais valide (ex: 77 123 45 67, 78..., 76..., 70..., 75... ou fixe 33...).",
                    HttpStatus.BAD_REQUEST
            );
        }

        // Format standard : +221 XX XXX XX XX
        return String.format("+221 %s %s %s %s",
                digitsOnly.substring(0, 2),
                digitsOnly.substring(2, 5),
                digitsOnly.substring(5, 7),
                digitsOnly.substring(7, 9)
        );
    }
}
