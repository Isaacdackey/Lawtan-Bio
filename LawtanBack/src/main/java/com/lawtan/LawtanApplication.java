package com.lawtan;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@SpringBootApplication
public class LawtanApplication {

    public static void main(String[] args) {
        loadDotenv();
        SpringApplication.run(LawtanApplication.class, args);
    }

    private static void loadDotenv() {
        Path[] candidates = new Path[]{
            Paths.get(".env"),
            Paths.get("LawtanBack", ".env"),
            Paths.get("..", ".env")
        };
        for (Path path : candidates) {
            if (Files.isRegularFile(path)) {
                try (BufferedReader reader = Files.newBufferedReader(path, StandardCharsets.UTF_8)) {
                    String line;
                    int count = 0;
                    while ((line = reader.readLine()) != null) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                            continue;
                        }
                        int eqIndex = line.indexOf('=');
                        String key = line.substring(0, eqIndex).trim();
                        String value = line.substring(eqIndex + 1).trim();
                        if ((value.startsWith("\"") && value.endsWith("\"")) ||
                            (value.startsWith("'") && value.endsWith("'"))) {
                            value = value.substring(1, value.length() - 1);
                        }
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, value);
                            count++;
                        }
                    }
                    System.out.println("Fichier .env charge (" + count + " variables) depuis : " + path.toAbsolutePath());
                } catch (Exception e) {
                    System.err.println("Impossible de charger .env : " + e.getMessage());
                }
                break;
            }
        }
    }
}
