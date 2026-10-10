package com.lawtan.service;

import com.lawtan.dto.TraceabilityLotDTO;

import java.util.List;

public interface TraceabilityService {

    /** Tous les lots de production tracés, du plus récent au plus ancien. */
    List<TraceabilityLotDTO> getAllLots();

    /** Passeport d'un lot précis, par son numéro. */
    TraceabilityLotDTO getLotByNumber(String lotNumber);
}
