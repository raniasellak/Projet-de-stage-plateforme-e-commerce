package ma.Vala.Boutique.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Configuration pour l'envoi d'emails
 * Configure le serveur SMTP pour l'envoi des emails de contact
 */
@Configuration
public class EmailConfig {

    @Value("${spring.mail.host:smtp.gmail.com}")
    private String mailHost;

    @Value("${spring.mail.port:587}")
    private int mailPort;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String mailUsername;

    @Value("${spring.mail.password:your-app-password}")
    private String mailPassword;

    @Value("${spring.mail.properties.mail.smtp.auth:true}")
    private boolean mailAuth;

    @Value("${spring.mail.properties.mail.smtp.starttls.enable:true}")
    private boolean startTlsEnable;

    @Value("${spring.mail.properties.mail.smtp.starttls.required:true}")
    private boolean startTlsRequired;

    /**
     * Configuration du JavaMailSender
     * Bean principal pour l'envoi d'emails
     */
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();

        // Configuration du serveur SMTP
        mailSender.setHost(mailHost);
        mailSender.setPort(mailPort);
        mailSender.setUsername(mailUsername);
        mailSender.setPassword(mailPassword);

        // Propriétés avancées du serveur SMTP
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", mailAuth);
        props.put("mail.smtp.starttls.enable", startTlsEnable);
        props.put("mail.smtp.starttls.required", startTlsRequired);
        props.put("mail.smtp.connectiontimeout", "10000"); // 10 secondes
        props.put("mail.smtp.timeout", "10000"); // 10 secondes
        props.put("mail.smtp.writetimeout", "10000"); // 10 secondes

        // Configuration pour Gmail (optionnel)
        if (mailHost.contains("gmail")) {
            props.put("mail.smtp.ssl.protocols", "TLSv1.2");
            props.put("mail.smtp.ssl.ciphersuites", "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256");
        }

        // Debugging (à activer seulement en développement)
        // props.put("mail.debug", "true");

        return mailSender;
    }
}
