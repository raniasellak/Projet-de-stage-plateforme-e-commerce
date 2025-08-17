package ma.Vala.Boutique.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Entité JPA pour stocker les messages de contact en base de données
 * Permet de garder un historique de tous les messages reçus
 */
@Entity
@Table(name = "contact_messages")
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_type", nullable = false, length = 50)
    private String requestType;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "subject", nullable = false, length = 255)
    private String subject;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "user_agent", columnDefinition = "TEXT")
    private String userAgent;

    @Column(name = "has_attachments")
    private Boolean hasAttachments = false;

    @Column(name = "attachment_count")
    private Integer attachmentCount = 0;

    @Column(name = "email_sent")
    private Boolean emailSent = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "processed_at")
    private LocalDateTime processedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ContactStatus status = ContactStatus.NOUVEAU;

    @Column(name = "admin_notes", columnDefinition = "TEXT")
    private String adminNotes;

    // Enum pour le statut du message
    public enum ContactStatus {
        NOUVEAU,        // Message nouvellement reçu
        EN_COURS,       // En cours de traitement
        REPONDU,        // Réponse envoyée
        RESOLU,         // Problème résolu
        ARCHIVE         // Archivé
    }

    // Constructeurs
    public ContactMessage() {
        this.createdAt = LocalDateTime.now();
    }

    public ContactMessage(String requestType, String firstName, String lastName,
                          String email, String phone, String subject, String message) {
        this();
        this.requestType = requestType;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.phone = phone;
        this.subject = subject;
        this.message = message;
    }

    // Getters et Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public Boolean getHasAttachments() {
        return hasAttachments;
    }

    public void setHasAttachments(Boolean hasAttachments) {
        this.hasAttachments = hasAttachments;
    }

    public Integer getAttachmentCount() {
        return attachmentCount;
    }

    public void setAttachmentCount(Integer attachmentCount) {
        this.attachmentCount = attachmentCount;
    }

    public Boolean getEmailSent() {
        return emailSent;
    }

    public void setEmailSent(Boolean emailSent) {
        this.emailSent = emailSent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getSentAt() {
        return sentAt;
    }

    public void setSentAt(LocalDateTime sentAt) {
        this.sentAt = sentAt;
    }

    public LocalDateTime getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(LocalDateTime processedAt) {
        this.processedAt = processedAt;
    }

    public ContactStatus getStatus() {
        return status;
    }

    public void setStatus(ContactStatus status) {
        this.status = status;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    // Méthodes utilitaires
    public String getFullName() {
        return firstName + " " + lastName;
    }

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

    /**
     * Marque le message comme traité
     */
    public void markAsProcessed() {
        this.processedAt = LocalDateTime.now();
        this.status = ContactStatus.REPONDU;
    }

    /**
     * Marque le message comme résolu
     */
    public void markAsResolved() {
        this.processedAt = LocalDateTime.now();
        this.status = ContactStatus.RESOLU;
    }

    @Override
    public String toString() {
        return "ContactMessage{" +
                "id=" + id +
                ", requestType='" + requestType + '\'' +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", email='" + email + '\'' +
                ", subject='" + subject + '\'' +
                ", status=" + status +
                ", createdAt=" + createdAt +
                '}';
    }
}