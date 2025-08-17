package ma.Vala.Boutique.repository;

import ma.Vala.Boutique.model.ContactMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository pour la gestion des données ContactMessage
 * Interface qui étend JpaRepository pour les opérations CRUD de base
 * + méthodes personnalisées pour les besoins spécifiques
 */
@Repository
public interface ContactRepository extends JpaRepository<ContactMessage, Long> {

    // Requêtes de base par champ

    /**
     * Trouve tous les messages par type de demande
     */
    List<ContactMessage> findByRequestType(String requestType);

    /**
     * Trouve tous les messages par email
     */
    List<ContactMessage> findByEmail(String email);

    /**
     * Trouve tous les messages par statut
     */
    List<ContactMessage> findByStatus(ContactMessage.ContactStatus status);

    /**
     * Trouve tous les messages non traités (nouveaux et en cours)
     */
    @Query("SELECT c FROM ContactMessage c WHERE c.status IN ('NOUVEAU', 'EN_COURS') ORDER BY c.createdAt DESC")
    List<ContactMessage> findUnprocessedMessages();

    /**
     * Trouve les messages créés dans une période donnée
     */
    @Query("SELECT c FROM ContactMessage c WHERE c.createdAt BETWEEN :startDate AND :endDate ORDER BY c.createdAt DESC")
    List<ContactMessage> findByDateRange(@Param("startDate") LocalDateTime startDate,
                                         @Param("endDate") LocalDateTime endDate);

    /**
     * Trouve les messages avec pièces jointes
     */
    List<ContactMessage> findByHasAttachmentsTrue();

    /**
     * Trouve les messages où l'email n'a pas été envoyé
     */
    List<ContactMessage> findByEmailSentFalse();

    // Requêtes de statistiques

    /**
     * Compte les messages par statut
     */
    @Query("SELECT c.status, COUNT(c) FROM ContactMessage c GROUP BY c.status")
    List<Object[]> countMessagesByStatus();

    /**
     * Compte les messages par type de demande
     */
    @Query("SELECT c.requestType, COUNT(c) FROM ContactMessage c GROUP BY c.requestType")
    List<Object[]> countMessagesByRequestType();

    /**
     * Compte les messages créés aujourd'hui
     */
    @Query("SELECT COUNT(c) FROM ContactMessage c WHERE DATE(c.createdAt) = CURRENT_DATE")
    Long countTodayMessages();

    /**
     * Compte les messages créés cette semaine
     */
    @Query("SELECT COUNT(c) FROM ContactMessage c WHERE WEEK(c.createdAt) = WEEK(CURRENT_DATE) AND YEAR(c.createdAt) = YEAR(CURRENT_DATE)")
    Long countThisWeekMessages();

    /**
     * Compte les messages créés ce mois
     */
    @Query("SELECT COUNT(c) FROM ContactMessage c WHERE MONTH(c.createdAt) = MONTH(CURRENT_DATE) AND YEAR(c.createdAt) = YEAR(CURRENT_DATE)")
    Long countThisMonthMessages();

    // Requêtes de recherche avancée

    /**
     * Recherche dans tous les champs texte
     */
    @Query("SELECT c FROM ContactMessage c WHERE " +
            "LOWER(c.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.lastName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.subject) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(c.message) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<ContactMessage> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * Trouve les messages urgents (réclamations non traitées de plus de 24h)
     */
    @Query("SELECT c FROM ContactMessage c WHERE " +
            "c.requestType = 'reclamation' AND " +
            "c.status IN ('NOUVEAU', 'EN_COURS') AND " +
            "c.createdAt < :urgentThreshold")
    List<ContactMessage> findUrgentMessages(@Param("urgentThreshold") LocalDateTime urgentThreshold);

    /**
     * Trouve les derniers messages avec pagination
     */
    Page<ContactMessage> findAllByOrderByCreatedAtDesc(Pageable pageable);

    /**
     * Trouve les messages d'un client spécifique
     */
    @Query("SELECT c FROM ContactMessage c WHERE c.email = :email ORDER BY c.createdAt DESC")
    List<ContactMessage> findCustomerHistory(@Param("email") String email);

    // Requêtes pour l'administration

    /**
     * Trouve les messages à archiver (résolus depuis plus de 30 jours)
     */
    @Query("SELECT c FROM ContactMessage c WHERE " +
            "c.status = 'RESOLU' AND " +
            "c.processedAt < :archiveThreshold")
    List<ContactMessage> findMessagesToArchive(@Param("archiveThreshold") LocalDateTime archiveThreshold);

    /**
     * Trouve les messages par période et type
     */
    @Query("SELECT c FROM ContactMessage c WHERE " +
            "c.requestType = :requestType AND " +
            "c.createdAt BETWEEN :startDate AND :endDate " +
            "ORDER BY c.createdAt DESC")
    List<ContactMessage> findByRequestTypeAndDateRange(
            @Param("requestType") String requestType,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate
    );

    /**
     * Compte les messages non lus (nouveaux)
     */
    Long countByStatus(ContactMessage.ContactStatus status);

    /**
     * Trouve les top clients (par nombre de messages)
     */
    @Query("SELECT c.email, c.firstName, c.lastName, COUNT(c) as messageCount " +
            "FROM ContactMessage c " +
            "GROUP BY c.email, c.firstName, c.lastName " +
            "ORDER BY messageCount DESC")
    List<Object[]> findTopCustomers(Pageable pageable);

    /**
     * Supprime les messages archivés anciens
     */
    void deleteByStatusAndProcessedAtBefore(ContactMessage.ContactStatus status, LocalDateTime date);
}