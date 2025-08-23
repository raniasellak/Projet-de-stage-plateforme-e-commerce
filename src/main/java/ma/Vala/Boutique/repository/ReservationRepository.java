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
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    // Recherche par statut
    Page<Reservation> findByStatut(StatutReservation statut, Pageable pageable);

    // Recherche par email du client
    Page<Reservation> findByEmailContainingIgnoreCase(String email, Pageable pageable);

    // Recherche par produit
    Page<Reservation> findByProduitId(Long produitId, Pageable pageable);

    // Recherche par période
    @Query("SELECT r FROM Reservation r WHERE r.dateDepart >= :dateDebut AND r.dateRetour <= :dateFin")
    List<Reservation> findByPeriode(@Param("dateDebut") LocalDate dateDebut,
                                    @Param("dateFin") LocalDate dateFin);

    // Vérifier la disponibilité d'un produit pour une période donnée
    @Query("SELECT COUNT(r) FROM Reservation r WHERE r.produit.id = :produitId " +
            "AND r.statut IN ('EN_ATTENTE', 'CONFIRMEE', 'EN_COURS') " +
            "AND ((r.dateDepart <= :dateDepart AND r.dateRetour >= :dateDepart) " +
            "OR (r.dateDepart <= :dateRetour AND r.dateRetour >= :dateRetour) " +
            "OR (r.dateDepart >= :dateDepart AND r.dateRetour <= :dateRetour))")
    Long countReservationsConflictuelles(@Param("produitId") Long produitId,
                                         @Param("dateDepart") LocalDate dateDepart,
                                         @Param("dateRetour") LocalDate dateRetour);

    // Recherche des réservations d'un client par email
    List<Reservation> findByEmailOrderByDateCreationDesc(String email);

    // Statistiques - nombre de réservations par mois
    @Query("SELECT YEAR(r.dateCreation), MONTH(r.dateCreation), COUNT(r) " +
            "FROM Reservation r " +
            "GROUP BY YEAR(r.dateCreation), MONTH(r.dateCreation) " +
            "ORDER BY YEAR(r.dateCreation) DESC, MONTH(r.dateCreation) DESC")
    List<Object[]> getReservationsStatsByMonth();

    // Recherche des réservations à venir
    @Query("SELECT r FROM Reservation r WHERE r.dateDepart > CURRENT_DATE " +
            "AND r.statut IN ('EN_ATTENTE', 'CONFIRMEE') " +
            "ORDER BY r.dateDepart ASC")
    List<Reservation> findUpcomingReservations();

    // Recherche avancée
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