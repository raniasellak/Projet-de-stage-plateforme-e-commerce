package ma.Vala.Boutique.web;

import jakarta.validation.Valid;
import ma.Vala.Boutique.entities.Produit;
import ma.Vala.Boutique.entities.Reservation;
import ma.Vala.Boutique.repository.ProduitRepository;
import ma.Vala.Boutique.repository.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:60141"})
public class ReservationApiController {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ProduitRepository produitRepository;

    // Créer une réservation
    @PostMapping("/reservations")
    public ResponseEntity<?> createReservation(@Valid @RequestBody ReservationRequest request) {
        try {
            System.out.println("=== DEBUG CRÉATION RÉSERVATION ===");
            System.out.println("Données reçues: " + request);

            // Validation du produit
            Optional<Produit> produitOpt = produitRepository.findById(request.getProduitId());
            if (!produitOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Produit non trouvé"));
            }

            Produit produit = produitOpt.get();

            // Validation des dates
            LocalDate dateDepart = LocalDate.parse(request.getDateDepart());
            LocalDate dateRetour = LocalDate.parse(request.getDateRetour());

            if (dateDepart.isAfter(dateRetour)) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("La date de départ doit être antérieure à la date de retour"));
            }

            if (dateDepart.isBefore(LocalDate.now())) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("La date de départ ne peut pas être dans le passé"));
            }

            // Calcul du nombre de jours et du prix total
            long nombreJours = ChronoUnit.DAYS.between(dateDepart, dateRetour);
            if (nombreJours <= 0) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("La durée de location doit être d'au moins 1 jour"));
            }

            double prixTotal = nombreJours * produit.getPrix();

            // Vérification de la disponibilité
            Long reservationsConflictuelles = reservationRepository.countReservationsConflictuelles(
                    request.getProduitId(), dateDepart, dateRetour);

            if (reservationsConflictuelles >= produit.getQuantite()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Aucun véhicule disponible pour cette période"));
            }

            // Création de la réservation
            Reservation reservation = Reservation.builder()
                    .produit(produit)
                    .dateDepart(dateDepart)
                    .dateRetour(dateRetour)
                    .nom(request.getNom().trim())
                    .prenom(request.getPrenom().trim())
                    .telephone(request.getTelephone().trim())
                    .email(request.getEmail().toLowerCase().trim())
                    .lieuPrise(request.getLieuPrise())
                    .lieuRetour(request.getLieuRetour())
                    .prixTotal(prixTotal)
                    .nombreJours((int) nombreJours)
                    .statut(Reservation.StatutReservation.EN_ATTENTE)
                    .build();

            Reservation savedReservation = reservationRepository.save(reservation);
            System.out.println("Réservation créée avec l'ID: " + savedReservation.getId());

            // Créer la réponse avec les détails complets
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Réservation créée avec succès");
            response.put("reservation", createReservationResponse(savedReservation));

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            System.err.println("Erreur lors de la création de la réservation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la création de la réservation: " + e.getMessage()));
        }
    }

    // Récupérer toutes les réservations (admin)
    @GetMapping("/reservations")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> getAllReservations(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "statut", required = false) String statut) {

        try {
            PageRequest pageRequest = PageRequest.of(page, size,
                    Sort.by(Sort.Direction.DESC, "dateCreation"));

            Page<Reservation> reservationPage;

            if (email != null && !email.trim().isEmpty()) {
                reservationPage = reservationRepository.findByEmailContainingIgnoreCase(
                        email.trim(), pageRequest);
            } else {
                reservationPage = reservationRepository.findAll(pageRequest);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("reservations", reservationPage.getContent().stream()
                    .map(this::createReservationResponse).toList());
            response.put("totalItems", reservationPage.getTotalElements());
            response.put("totalPages", reservationPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur lors de la récupération des réservations: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // Récupérer une réservation par ID
    @GetMapping("/reservations/{id}")
    public ResponseEntity<?> getReservation(@PathVariable Long id) {
        try {
            Optional<Reservation> reservationOpt = reservationRepository.findById(id);

            if (!reservationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            return ResponseEntity.ok(createReservationResponse(reservationOpt.get()));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la récupération de la réservation"));
        }
    }

    // Récupérer les réservations d'un client par email
    @GetMapping("/reservations/client/{email}")
    public ResponseEntity<?> getClientReservations(@PathVariable String email) {
        try {
            var reservations = reservationRepository.findByEmailOrderByDateCreationDesc(email);

            return ResponseEntity.ok(reservations.stream()
                    .map(this::createReservationResponse).toList());

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la récupération des réservations du client"));
        }
    }

    // Modifier le statut d'une réservation (admin)
    @PutMapping("/reservations/{id}/statut")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateReservationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        try {
            Optional<Reservation> reservationOpt = reservationRepository.findById(id);

            if (!reservationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Reservation reservation = reservationOpt.get();
            String nouveauStatut = request.get("statut");

            try {
                Reservation.StatutReservation statut = Reservation.StatutReservation.valueOf(nouveauStatut);
                reservation.setStatut(statut);
                reservationRepository.save(reservation);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Statut mis à jour avec succès");
                response.put("reservation", createReservationResponse(reservation));

                return ResponseEntity.ok(response);

            } catch (IllegalArgumentException e) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Statut invalide: " + nouveauStatut));
            }

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la mise à jour du statut"));
        }
    }

    // Supprimer une réservation (admin)
    @DeleteMapping("/reservations/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteReservation(@PathVariable Long id) {
        try {
            Optional<Reservation> reservationOpt = reservationRepository.findById(id);

            if (!reservationOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            reservationRepository.deleteById(id);

            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("message", "Réservation supprimée avec succès");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("message", "Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Vérifier la disponibilité d'un produit
    @GetMapping("/reservations/disponibilite/{produitId}")
    public ResponseEntity<?> verifierDisponibilite(
            @PathVariable Long produitId,
            @RequestParam String dateDepart,
            @RequestParam String dateRetour) {

        try {
            Optional<Produit> produitOpt = produitRepository.findById(produitId);
            if (!produitOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Produit non trouvé"));
            }

            Produit produit = produitOpt.get();
            LocalDate debut = LocalDate.parse(dateDepart);
            LocalDate fin = LocalDate.parse(dateRetour);

            Long reservationsConflictuelles = reservationRepository.countReservationsConflictuelles(
                    produitId, debut, fin);

            boolean disponible = reservationsConflictuelles < produit.getQuantite();
            int vehiculesDisponibles = produit.getQuantite() - reservationsConflictuelles.intValue();

            Map<String, Object> response = new HashMap<>();
            response.put("disponible", disponible);
            response.put("vehiculesDisponibles", vehiculesDisponibles);
            response.put("quantiteTotal", produit.getQuantite());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la vérification de disponibilité"));
        }
    }

    // Méthodes utilitaires
    private Map<String, Object> createReservationResponse(Reservation reservation) {
        Map<String, Object> response = new HashMap<>();
        response.put("id", reservation.getId());
        response.put("dateDepart", reservation.getDateDepart().toString());
        response.put("dateRetour", reservation.getDateRetour().toString());
        response.put("nom", reservation.getNom());
        response.put("prenom", reservation.getPrenom());
        response.put("telephone", reservation.getTelephone());
        response.put("email", reservation.getEmail());
        response.put("lieuPrise", reservation.getLieuPrise());
        response.put("lieuRetour", reservation.getLieuRetour());
        response.put("prixTotal", reservation.getPrixTotal());
        response.put("nombreJours", reservation.getNombreJours());
        response.put("statut", reservation.getStatut().name());
        response.put("statutLabel", reservation.getStatut().getLabel());
        response.put("dateCreation", reservation.getDateCreation().toString());

        // Informations du produit
        Map<String, Object> produitInfo = new HashMap<>();
        produitInfo.put("id", reservation.getProduit().getId());
        produitInfo.put("nom", reservation.getProduit().getNom());
        produitInfo.put("marque", reservation.getProduit().getMarque());
        produitInfo.put("categorie", reservation.getProduit().getCategorie());
        produitInfo.put("imageUrl", reservation.getProduit().getImageUrl());
        response.put("produit", produitInfo);

        return response;
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        error.put("success", "false");
        return error;
    }

    // DTO pour les requêtes de réservation
    public static class ReservationRequest {
        private Long produitId;
        private String dateDepart;
        private String dateRetour;
        private String nom;
        private String prenom;
        private String telephone;
        private String email;
        private String lieuPrise;
        private String lieuRetour;
        private Double prixTotal;
        private Integer nombreJours;

        // Getters et Setters
        public Long getProduitId() { return produitId; }
        public void setProduitId(Long produitId) { this.produitId = produitId; }

        public String getDateDepart() { return dateDepart; }
        public void setDateDepart(String dateDepart) { this.dateDepart = dateDepart; }

        public String getDateRetour() { return dateRetour; }
        public void setDateRetour(String dateRetour) { this.dateRetour = dateRetour; }

        public String getNom() { return nom; }
        public void setNom(String nom) { this.nom = nom; }

        public String getPrenom() { return prenom; }
        public void setPrenom(String prenom) { this.prenom = prenom; }

        public String getTelephone() { return telephone; }
        public void setTelephone(String telephone) { this.telephone = telephone; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getLieuPrise() { return lieuPrise; }
        public void setLieuPrise(String lieuPrise) { this.lieuPrise = lieuPrise; }

        public String getLieuRetour() { return lieuRetour; }
        public void setLieuRetour(String lieuRetour) { this.lieuRetour = lieuRetour; }

        public Double getPrixTotal() { return prixTotal; }
        public void setPrixTotal(Double prixTotal) { this.prixTotal = prixTotal; }

        public Integer getNombreJours() { return nombreJours; }
        public void setNombreJours(Integer nombreJours) { this.nombreJours = nombreJours; }

        @Override
        public String toString() {
            return "ReservationRequest{" +
                    "produitId=" + produitId +
                    ", dateDepart='" + dateDepart + '\'' +
                    ", dateRetour='" + dateRetour + '\'' +
                    ", nom='" + nom + '\'' +
                    ", prenom='" + prenom + '\'' +
                    ", email='" + email + '\'' +
                    ", lieuPrise='" + lieuPrise + '\'' +
                    ", lieuRetour='" + lieuRetour + '\'' +
                    ", prixTotal=" + prixTotal +
                    ", nombreJours=" + nombreJours +
                    '}';
        }
    }
}