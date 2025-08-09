package ma.Vala.Boutique.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {

    // Adaptez selon votre format dans application.properties
    @Value("${cloudinary.cloud-name}")  // ou ${cloudinary.cloud_name} si vous gardez les underscores
    private String cloudName;

    @Value("${cloudinary.api-key}")     // ou ${cloudinary.api_key}
    private String apiKey;

    @Value("${cloudinary.api-secret}")  // ou ${cloudinary.api_secret}
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret
        ));
    }
}
