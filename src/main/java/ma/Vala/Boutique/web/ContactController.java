package ma.Vala.Boutique.web;

import ma.Vala.Boutique.dtos.ContactDto;
import ma.Vala.Boutique.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = {"http://localhost:4200","http://localhost:54094"}) // Ajustez selon votre configuration
public class ContactController {

    @Autowired
    private ContactService contactService;

    /**
     * Endpoint pour envoyer un email de contact
     *
     * @param requestType Type de demande
     * @param firstName Prénom
     * @param lastName Nom
     * @param email Email du client
     * @param phone Téléphone (optionnel)
     * @param subject Sujet
     * @param message Message
     * @param timestamp Timestamp
     * @param userAgent User Agent
     * @param files Fichiers joints (optionnel)
     * @return ResponseEntity avec le statut de l'envoi
     */
    @PostMapping("/send-email")
    public ResponseEntity<?> sendContactEmail(
            @RequestParam("requestType") String requestType,
            @RequestParam("firstName") String firstName,
            @RequestParam("lastName") String lastName,
            @RequestParam("email") String email,
            @RequestParam(value = "phone", required = false) String phone,
            @RequestParam("subject") String subject,
            @RequestParam("message") String message,
            @RequestParam("timestamp") String timestamp,
            @RequestParam("userAgent") String userAgent,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {

        try {
            // Création du DTO avec les données reçues
            ContactDto contactDto = new ContactDto();
            contactDto.setRequestType(requestType);
            contactDto.setFirstName(firstName);
            contactDto.setLastName(lastName);
            contactDto.setEmail(email);
            contactDto.setPhone(phone);
            contactDto.setSubject(subject);
            contactDto.setMessage(message);
            contactDto.setTimestamp(timestamp);
            contactDto.setUserAgent(userAgent);

            // Envoi de l'email via le service
            contactService.sendContactEmail(contactDto, files);

            // Réponse de succès
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Email envoyé avec succès");
            response.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            // Log de l'erreur
            System.err.println("Erreur lors de l'envoi de l'email: " + e.getMessage());
            e.printStackTrace();

            // Réponse d'erreur
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de l'envoi de l'email");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", System.currentTimeMillis());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    /**
     * Endpoint pour tester la connectivité
     */
    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> testConnection() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "OK");
        response.put("message", "Service de contact opérationnel");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));

        return ResponseEntity.ok(response);
    }
}