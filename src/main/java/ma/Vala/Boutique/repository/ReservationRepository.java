package ma.Vala.Boutique.repository;

import ma.Vala.Boutique.entities.Reservation;
import ma.Vala.Boutique.entities.Reservation.StatutReservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // ==========================
    // 🔹 Recherches simples
    // ==========================

    Page<Reservation> findByStatut(StatutReservation statut, Pageable pageable);
    List<Reservation> findByStatut(StatutReservation statut);

    Page<Reservation> findByEmailContainingIgnoreCase(String email, Pageable pageable);
    List<Reservation> findByEmailOrderByDateCreationDesc(String email);
    Page<Reservation> findByEmailOrderByDateCreationDesc(String email, Pageable pageable);

    Page<Reservation> findByProduitId(Long produitId, Pageable pageable);
    List<Reservation> findByProduitIdOrderByDateDepartAsc(Long produitId);

    // ==========================
    // 🔹 Recherche par période
    // ==========================

    @Query("SELECT r FROM Reservation r WHERE r.dateDepart >= :dateDebut AND r.dateRetour <= :dateFin")
    List<Reservation> findByPeriode(@Param("dateDebut") LocalDate dateDebut,
                                    @Param("dateFin") LocalDate dateFin);

    @Query("SELECT r FROM Reservation r WHERE r.dateDepart >= :dateDebut " +
            "AND r.dateDepart <= :dateFin ORDER BY r.dateDepart ASC")
    List<Reservation> findReservationsByPeriod(@Param("dateDebut") LocalDate dateDebut,
                                               @Param("dateFin") LocalDate dateFin);

    // ==========================
    // 🔹 Disponibilité & conflits
    // ==========================

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.produit.id = :produitId " +
            "AND r.statut IN ('EN_ATTENTE', 'CONFIRMEE', 'EN_COURS') " +
            "AND ((r.dateDepart <= :dateDepart AND r.dateRetour >= :dateDepart) " +
            "OR (r.dateDepart <= :dateRetour AND r.dateRetour >= :dateRetour) " +
            "OR (r.dateDepart >= :dateDepart AND r.dateRetour <= :dateRetour))")
    Long countReservationsConflictuelles(@Param("produitId") Long produitId,
                                         @Param("dateDepart") LocalDate dateDepart,
                                         @Param("dateRetour") LocalDate dateRetour);

    @Query("SELECT r FROM Reservation r WHERE r.produit.id = :produitId " +
            "AND r.statut IN ('EN_ATTENTE', 'CONFIRMEE', 'EN_COURS') " +
            "AND ((r.dateDepart < :dateRetour AND r.dateRetour > :dateDepart))")
    List<Reservation> findConflictingReservations(@Param("produitId") Long produitId,
                                                  @Param("dateDepart") LocalDate dateDepart,
                                                  @Param("dateRetour") LocalDate dateRetour);

    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.produit.id = :produitId " +
            "AND r.statut IN ('CONFIRMEE', 'EN_COURS') " +
            "AND r.dateDepart <= :dateRetour AND r.dateRetour >= :dateDepart")
    Long countConfirmedReservationsForPeriod(@Param("produitId") Long produitId,
                                             @Param("dateDepart") LocalDate dateDepart,
                                             @Param("dateRetour") LocalDate dateRetour);

    // ==========================
    // 🔹 Statistiques
    // ==========================

    @Query("SELECT YEAR(r.dateCreation), MONTH(r.dateCreation), COUNT(r) " +
            "FROM Reservation r " +
            "GROUP BY YEAR(r.dateCreation), MONTH(r.dateCreation) " +
            "ORDER BY YEAR(r.dateCreation) DESC, MONTH(r.dateCreation) DESC")
    List<Object[]> getReservationsStatsByMonth();

    long countByStatut(StatutReservation statut);

    @Query("SELECT SUM(r.prixTotal) FROM Reservation r " +
            "WHERE r.statut IN ('CONFIRMEE', 'EN_COURS', 'TERMINEE') " +
            "AND r.dateDepart >= :dateDebut AND r.dateDepart <= :dateFin")
    Double calculateRevenueByPeriod(@Param("dateDebut") LocalDate dateDebut,
                                    @Param("dateFin") LocalDate dateFin);

    // ==========================
    // 🔹 Notifications / suivi
    // ==========================

    @Query("SELECT r FROM Reservation r WHERE r.dateDepart > CURRENT_DATE " +
            "AND r.statut IN ('EN_ATTENTE', 'CONFIRMEE') " +
            "ORDER BY r.dateDepart ASC")
    List<Reservation> findUpcomingReservations();

    @Query("SELECT r FROM Reservation r WHERE r.statut IN ('CONFIRMEE', 'EN_COURS') " +
            "ORDER BY r.dateDepart ASC")
    List<Reservation> findActiveReservations();

    @Query("SELECT r FROM Reservation r WHERE r.statut = 'EN_COURS' " +
            "AND r.dateRetour = :date")
    List<Reservation> findReservationsEndingOn(@Param("date") LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.statut = 'CONFIRMEE' " +
            "AND r.dateDepart = :date")
    List<Reservation> findReservationsStartingOn(@Param("date") LocalDate date);

    @Query("SELECT r FROM Reservation r WHERE r.statut = 'EN_ATTENTE' " +
            "AND r.dateCreation < :dateLimit")
    List<Reservation> findExpiredPendingReservations(@Param("dateLimit") LocalDateTime dateLimit);

    // ==========================
    // 🔹 Recherche avancée
    // ==========================

    @Query("SELECT r FROM Reservation r WHERE " +
            "(:email IS NULL OR LOWER(r.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
            "(:statut IS NULL OR r.statut = :statut) AND " +
            "(:dateDebut IS NULL OR r.dateDepart >= :dateDebut) AND " +
            "(:dateFin IS NULL OR r.dateRetour <= :dateFin) AND " +
            "(:produitId IS NULL OR r.produit.id = :produitId)")
    Page<Reservation> findWithFilters(@Param("email") String email,
                                      @Param("statut") StatutReservation statut,
                                      @Param("dateDebut") LocalDate dateDebut,
                                      @Param("dateFin") LocalDate dateFin,
                                      @Param("produitId") Long produitId,
                                      Pageable pageable);
}
