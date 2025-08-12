package ma.Vala.Boutique.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public Map<String, Object> uploadFile(MultipartFile file) throws IOException {
        return uploadFile(file, "products");
    }

    public Map<String, Object> uploadFile(MultipartFile file, String folder) throws IOException {
        System.out.println("=== CLOUDINARY UPLOAD DEBUG ===");
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize());
        System.out.println("Content type: " + file.getContentType());
        System.out.println("Folder: " + folder);
        System.out.println("Current timestamp: " + Instant.now().getEpochSecond());

        try {
            // Vérifier la configuration Cloudinary - CORRECTION ICI
            com.cloudinary.Configuration config = cloudinary.config;
            System.out.println("Cloud name from config: " + config.cloudName);
            System.out.println("API key from config: " + config.apiKey);

            // Upload avec paramètres explicites
            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "quality", "auto",
                    "fetch_format", "auto",
                    "use_filename", false,
                    "unique_filename", true,
                    "overwrite", false
            ));

            System.out.println("Upload successful!");
            System.out.println("Secure URL: " + uploadResult.get("secure_url"));
            System.out.println("Public ID: " + uploadResult.get("public_id"));

            return uploadResult;

        } catch (Exception e) {
            System.err.println("Cloudinary upload error: " + e.getMessage());
            e.printStackTrace();
            throw new IOException("Échec de l'upload vers Cloudinary: " + e.getMessage(), e);
        }
    }

    public void deleteFile(String publicId) throws IOException {
        if (publicId != null && !publicId.trim().isEmpty()) {
            try {
                Map<String, Object> result = cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
                System.out.println("File deleted from Cloudinary: " + result.get("result"));
            } catch (Exception e) {
                System.err.println("Error deleting file from Cloudinary: " + e.getMessage());
                throw new IOException("Échec de la suppression de Cloudinary: " + e.getMessage(), e);
            }
        }
    }

    // Méthode pour tester la connexion - CORRECTION ICI
    public boolean testConnection() {
        try {
            com.cloudinary.Configuration config = cloudinary.config;
            return config.cloudName != null && config.apiKey != null && config.apiSecret != null;
        } catch (Exception e) {
            System.err.println("Cloudinary connection test failed: " + e.getMessage());
            return false;
        }
    }
}