package ma.Vala.Boutique.service;

import ma.Vala.Boutique.dtos.ContactDto;
import ma.Vala.Boutique.model.ContactMessage;
import ma.Vala.Boutique.repository.ContactRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Service pour gérer l'envoi des emails de contact
 * Contient toute la logique métier pour traiter les demandes de contact
 */
@Service
public class ContactService {

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ContactRepository contactRepository;

    // Configuration depuis application.properties
    @Value("${app.contact.email.to:contact@votreagence.com}")
    private String agencyEmail;

    @Value("${app.contact.email.from:noreply@votreagence.com}")
    private String fromEmail;

    @Value("${app.contact.email.subject.prefix:[CONTACT AGENCE] }")
    private String subjectPrefix;

    /**
     * Envoie un email de contact et sauvegarde en base de données
     *
     * @param contactDto Données du formulaire
     * @param files Fichiers joints (optionnel)
     * @throws MessagingException Si erreur lors de l'envoi
     * @throws IOException Si erreur lors du traitement des fichiers
     */
    public void sendContactEmail(ContactDto contactDto, List<MultipartFile> files)
            throws MessagingException, IOException {

        // 1. Sauvegarder en base de données
        ContactMessage contactMessage = saveContactMessage(contactDto, files);

        // 2. Envoyer l'email à l'agence
        sendEmailToAgency(contactDto, files);

        // 3. Envoyer un email de confirmation au client
        sendConfirmationEmailToClient(contactDto);

        // 4. Mettre à jour le statut en base
        contactMessage.setEmailSent(true);
        contactMessage.setSentAt(LocalDateTime.now());
        contactRepository.save(contactMessage);
    }

    /**
     * Sauvegarde le message de contact en base de données
     */
    private ContactMessage saveContactMessage(ContactDto contactDto, List<MultipartFile> files) {
        ContactMessage contactMessage = new ContactMessage();
        contactMessage.setRequestType(contactDto.getRequestType());
        contactMessage.setFirstName(contactDto.getFirstName());
        contactMessage.setLastName(contactDto.getLastName());
        contactMessage.setEmail(contactDto.getEmail());
        contactMessage.setPhone(contactDto.getPhone());
        contactMessage.setSubject(contactDto.getSubject());
        contactMessage.setMessage(contactDto.getMessage());
        contactMessage.setUserAgent(contactDto.getUserAgent());
        contactMessage.setCreatedAt(LocalDateTime.now());
        contactMessage.setEmailSent(false);

        // Compter les fichiers joints
        if (files != null && !files.isEmpty()) {
            contactMessage.setHasAttachments(true);
            contactMessage.setAttachmentCount(files.size());
        }

        return contactRepository.save(contactMessage);
    }

    /**
     * Envoie l'email principal à l'agence
     */
    private void sendEmailToAgency(ContactDto contactDto, List<MultipartFile> files)
            throws MessagingException, IOException {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        // Configuration du message
        helper.setFrom(fromEmail);
        helper.setTo(agencyEmail);
        helper.setReplyTo(contactDto.getEmail()); // Pour répondre directement au client
        helper.setSubject(subjectPrefix + contactDto.getFormattedRequestType() + " - " + contactDto.getSubject());

        // Corps du message HTML
        String htmlContent = buildEmailContent(contactDto);
        helper.setText(htmlContent, true);

        // Ajout des pièces jointes
        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    ByteArrayResource resource = new ByteArrayResource(file.getBytes());
                    helper.addAttachment(file.getOriginalFilename(), resource);
                }
            }
        }

        // Envoi du message
        mailSender.send(message);
    }

    /**
     * Envoie un email de confirmation au client
     */
    private void sendConfirmationEmailToClient(ContactDto contactDto) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setFrom(fromEmail);
        helper.setTo(contactDto.getEmail());
        helper.setSubject("Confirmation de réception - " + contactDto.getSubject());

        String confirmationContent = buildConfirmationEmailContent(contactDto);
        helper.setText(confirmationContent, true);

        mailSender.send(message);
    }

    /**
     * Construit le contenu HTML de l'email principal
     */
    private String buildEmailContent(ContactDto contactDto) {
        StringBuilder content = new StringBuilder();

        content.append("<!DOCTYPE html>")
                .append("<html><head><meta charset='UTF-8'><title>Nouveau message de contact</title>")
                .append("<style>")
                .append("body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }")
                .append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }")
                .append(".header { background: linear-gradient(135deg, #033c4f, #1976d2); color: white; padding: 20px; border-radius: 8px; text-align: center; }")
                .append(".content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }")
                .append(".field { margin: 15px 0; padding: 10px; background: white; border-left: 4px solid #1976d2; }")
                .append(".label { font-weight: bold; color: #033c4f; }")
                .append(".value { margin-top: 5px; }")
                .append(".message-box { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; }")
                .append(".footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }")
                .append("</style></head><body>")

                .append("<div class='container'>")
                .append("<div class='header'>")
                .append("<h1>🚗 Nouveau Message de Contact</h1>")
                .append("<p>Type: ").append(contactDto.getFormattedRequestType()).append("</p>")
                .append("</div>")

                .append("<div class='content'>")

                .append("<div class='field'>")
                .append("<div class='label'>👤 Client:</div>")
                .append("<div class='value'>").append(contactDto.getFullName()).append("</div>")
                .append("</div>")

                .append("<div class='field'>")
                .append("<div class='label'>📧 Email:</div>")
                .append("<div class='value'>").append(contactDto.getEmail()).append("</div>")
                .append("</div>");

        if (contactDto.getPhone() != null && !contactDto.getPhone().isEmpty()) {
            content.append("<div class='field'>")
                    .append("<div class='label'>📞 Téléphone:</div>")
                    .append("<div class='value'>").append(contactDto.getPhone()).append("</div>")
                    .append("</div>");
        }

        content.append("<div class='field'>")
                .append("<div class='label'>📝 Sujet:</div>")
                .append("<div class='value'>").append(contactDto.getSubject()).append("</div>")
                .append("</div>")

                .append("<div class='field'>")
                .append("<div class='label'>💬 Message:</div>")
                .append("<div class='message-box'>").append(contactDto.getMessage().replace("\n", "<br>")).append("</div>")
                .append("</div>")

                .append("<div class='field'>")
                .append("<div class='label'>🕐 Reçu le:</div>")
                .append("<div class='value'>").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy à HH:mm"))).append("</div>")
                .append("</div>")

                .append("</div>")

                .append("<div class='footer'>")
                .append("<p>Ce message a été envoyé depuis le formulaire de contact de votre site web.</p>")
                .append("<p>Vous pouvez répondre directement à cet email pour contacter le client.</p>")
                .append("</div>")

                .append("</div></body></html>");

        return content.toString();
    }

    /**
     * Construit le contenu HTML de l'email de confirmation
     */
    private String buildConfirmationEmailContent(ContactDto contactDto) {
        StringBuilder content = new StringBuilder();

        content.append("<!DOCTYPE html>")
                .append("<html><head><meta charset='UTF-8'><title>Confirmation de réception</title>")
                .append("<style>")
                .append("body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }")
                .append(".container { max-width: 600px; margin: 0 auto; padding: 20px; }")
                .append(".header { background: linear-gradient(135deg, #27ae60, #2ecc71); color: white; padding: 20px; border-radius: 8px; text-align: center; }")
                .append(".content { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }")
                .append(".highlight { background: white; padding: 15px; border-radius: 5px; margin: 10px 0; border-left: 4px solid #27ae60; }")
                .append(".footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }")
                .append("</style></head><body>")

                .append("<div class='container'>")
                .append("<div class='header'>")
                .append("<h1>✅ Message Bien Reçu !</h1>")
                .append("<p>Merci pour votre confiance</p>")
                .append("</div>")

                .append("<div class='content'>")
                .append("<p>Bonjour <strong>").append(contactDto.getFirstName()).append("</strong>,</p>")
                .append("<p>Nous avons bien reçu votre message concernant : <strong>").append(contactDto.getSubject()).append("</strong></p>")

                .append("<div class='highlight'>")
                .append("<h3>🚀 Prochaines étapes :</h3>")
                .append("<ul>")
                .append("<li>Notre équipe va examiner votre demande</li>")
                .append("<li>Vous recevrez une réponse sous 24h ouvrables</li>")
                .append("<li>Pour les urgences, contactez-nous au +33 1 23 45 67 89</li>")
                .append("</ul>")
                .append("</div>")

                .append("<p>Nous nous engageons à vous offrir le meilleur service possible.</p>")
                .append("<p>Cordialement,<br><strong>L'équipe de Votre Agence</strong></p>")
                .append("</div>")

                .append("<div class='footer'>")
                .append("<p>Cet email de confirmation a été généré automatiquement.</p>")
                .append("<p>Si vous n'êtes pas à l'origine de ce message, vous pouvez l'ignorer.</p>")
                .append("</div>")

                .append("</div></body></html>");

        return content.toString();
    }
}