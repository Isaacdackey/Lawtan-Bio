package com.lawtan.controller;

import com.lawtan.dto.TraceabilityLotDTO;
import com.lawtan.service.TraceabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/traceability")
@RequiredArgsConstructor
public class TraceabilityController {

    private final TraceabilityService traceabilityService;

    @GetMapping("/lots")
    public ResponseEntity<List<TraceabilityLotDTO>> getAllLots() {
        return ResponseEntity.ok(traceabilityService.getAllLots());
    }

    @GetMapping("/lots/{lotNumber}")
    public ResponseEntity<TraceabilityLotDTO> getLot(@PathVariable String lotNumber) {
        TraceabilityLotDTO lot = traceabilityService.getLotByNumber(lotNumber);
        return lot != null ? ResponseEntity.ok(lot) : ResponseEntity.notFound().build();
    }
}