package ma.Vala.Boutique.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.io.Serializable;

/**
 * DTO pour les données du formulaire de contact
 * Cet objet transporte les données entre le frontend et le backend
 */
public class ContactDto implements Serializable {

    @NotBlank(message = "Le type de demande est requis")
    private String requestType;

    @NotBlank(message = "Le prénom est requis")
    @Size(min = 2, message = "Le prénom doit contenir au moins 2 caractères")
    private String firstName;

    @NotBlank(message = "Le nom est requis")
    @Size(min = 2, message = "Le nom doit contenir au moins 2 caractères")
    private String lastName;

    @NotBlank(message = "L'email est requis")
    @Email(message = "L'email doit être valide")
    private String email;

    private String phone; // Optionnel

    @NotBlank(message = "Le sujet est requis")
    @Size(min = 3, message = "Le sujet doit contenir au moins 3 caractères")
    private String subject;

    @NotBlank(message = "Le message est requis")
    @Size(min = 10, message = "Le message doit contenir au moins 10 caractères")
    private String message;

    private String timestamp;
    private String userAgent;

    // Constructeurs
    public ContactDto() {}

    public ContactDto(String requestType, String firstName, String lastName,
                      String email, String phone, String subject, String message,
                      String timestamp, String userAgent) {
        this.requestType = requestType;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.subject = subject;
        this.message = message;
        this.timestamp = timestamp;
        this.userAgent = userAgent;
    }

    // Getters et Setters
    public String getRequestType() {
        return requestType;
    }

    public void setRequestType(String requestType) {
        this.requestType = requestType;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(String subject) {
        this.subject = subject;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    /**
     * Méthode utilitaire pour obtenir le nom complet
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    /**
     * Méthode utilitaire pour formatter le type de demande
     */
    public String getFormattedRequestType() {
        switch (requestType.toLowerCase()) {
            case "reservation":
                return "Réservation";
            case "reclamation":
                return "Réclamation";
            case "devis":
                return "Demande de devis";
            case "information":
                return "Demande d'information";
            case "autre":
                return "Autre";
            default:
                return requestType;
        }
    }

    @Override
    public String toString() {
        return "ContactDto{" +
                "requestType='" + requestType + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", phone='" + phone + '\'' +
                ", subject='" + subject + '\'' +
                ", message='" + message + '\'' +
                ", timestamp='" + timestamp + '\'' +
                '}';
    }
}