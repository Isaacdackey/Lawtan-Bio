package com.lawtan.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.folder}")
    private String folder;

    /**
     * Upload un fichier MultipartFile vers le dossier configuré sur Cloudinary
     */
    public String uploadImage(MultipartFile file, String subFolder) throws IOException {
        String targetFolder = subFolder != null && !subFolder.isBlank() 
                ? folder + "/" + subFolder.trim() 
                : folder;

        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", targetFolder,
                "resource_type", "auto"
        ));

        String secureUrl = (String) uploadResult.get("secure_url");
        log.info("Image uploadée sur Cloudinary dans [{}]: {}", targetFolder, secureUrl);
        return secureUrl;
    }

    /**
     * Upload avec nom public personnalisé (public_id)
     */
    public String uploadImageWithPublicId(byte[] data, String publicId, String subFolder) throws IOException {
        String targetFolder = subFolder != null && !subFolder.isBlank() 
                ? folder + "/" + subFolder.trim() 
                : folder;

        Map<?, ?> uploadResult = cloudinary.uploader().upload(data, ObjectUtils.asMap(
                "folder", targetFolder,
                "public_id", publicId,
                "overwrite", true,
                "resource_type", "auto"
        ));

        String secureUrl = (String) uploadResult.get("secure_url");
        log.info("Image uploadée sur Cloudinary avec publicId [{}]: {}", publicId, secureUrl);
        return secureUrl;
    }

    /**
     * Supprime une ressource sur Cloudinary via son public_id
     */
    public void deleteImage(String publicId) {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Image supprimée de Cloudinary : {}", publicId);
        } catch (IOException e) {
            log.error("Erreur lors de la suppression de l'image Cloudinary {}: {}", publicId, e.getMessage());
        }
    }
}
