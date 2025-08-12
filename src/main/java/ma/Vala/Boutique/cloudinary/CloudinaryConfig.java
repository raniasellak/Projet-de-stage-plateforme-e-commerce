package ma.Vala.Boutique.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @PostConstruct
    public void validateConfig() {
        System.out.println("=== CLOUDINARY CONFIG VALIDATION ===");
        System.out.println("Cloud Name: " + (cloudName != null ? cloudName : "NULL"));
        System.out.println("API Key: " + (apiKey != null ? apiKey.substring(0, 3) + "***" : "NULL"));
        System.out.println("API Secret: " + (apiSecret != null ? "***" + apiSecret.substring(apiSecret.length() - 3) : "NULL"));

        if (cloudName == null || cloudName.trim().isEmpty()) {
            throw new IllegalStateException("Cloudinary cloud_name is not configured");
        }
        if (apiKey == null || apiKey.trim().isEmpty()) {
            throw new IllegalStateException("Cloudinary api_key is not configured");
        }
        if (apiSecret == null || apiSecret.trim().isEmpty()) {
            throw new IllegalStateException("Cloudinary api_secret is not configured");
        }
    }

    @Bean
    public Cloudinary cloudinary() {
        System.out.println("Creating Cloudinary instance...");

        Cloudinary cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName.trim(),
                "api_key", apiKey.trim(),
                "api_secret", apiSecret.trim(),
                "secure", true
        ));

        // Test de la configuration - CORRECTION ICI
        try {
            com.cloudinary.Configuration config = cloudinary.config;
            System.out.println("Cloudinary config loaded: " + config.cloudName);
        } catch (Exception e) {
            System.err.println("Error testing Cloudinary config: " + e.getMessage());
        }

        return cloudinary;
    }
}