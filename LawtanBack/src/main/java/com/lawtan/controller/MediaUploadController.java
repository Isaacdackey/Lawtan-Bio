package com.lawtan.controller;

import com.lawtan.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Gestion Médias & Cloudinary", description = "Endpoints d'upload et gestion d'images sur Cloudinary")
public class MediaUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Téléverser une image vers Cloudinary (dossier lawtan-bio)")
    public ResponseEntity<Map<String, String>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", required = false) String subFolder) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Fichier vide ou absent"));
        }

        try {
            String url = cloudinaryService.uploadImage(file, subFolder);
            return ResponseEntity.ok(Map.of(
                    "url", url,
                    "filename", file.getOriginalFilename() != null ? file.getOriginalFilename() : "image"
            ));
        } catch (IOException e) {
            log.error("Échec de l'upload Cloudinary", e);
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur lors du transfert : " + e.getMessage()));
        }
    }
}
