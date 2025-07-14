package ma.Vala.Boutique.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "duqpq0teg",
                "api_key", "364578432324232",
                "api_secret", "TON_SECRET_API",
                "secure", true
        ));
    }
}
