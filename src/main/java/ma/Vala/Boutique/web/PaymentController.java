package ma.Vala.Boutique.web;

import jakarta.validation.Valid;
import ma.Vala.Boutique.entities.Reservation;
import ma.Vala.Boutique.entities.Produit;
import ma.Vala.Boutique.repository.ReservationRepository;
import ma.Vala.Boutique.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:54798"})
public class PaymentController {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ProduitRepository produitRepository;

    // Initier un paiement
    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@Valid @RequestBody PaymentRequest request) {
        try {
            System.out.println("=== DEBUG INITIATION PAIEMENT ===");
            System.out.println("Réservation ID: " + request.getReservationId());
            System.out.println("Montant: " + request.getAmount());

            // Vérifier que la réservation existe
            Optional<Reservation> reservationOpt = reservationRepository.findById(request.getReservationId());
            if (!reservationOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Réservation non trouvée"));
            }

            Reservation reservation = reservationOpt.get();

            // Vérifier que la réservation est en attente
            if (reservation.getStatut() != Reservation.StatutReservation.EN_ATTENTE) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Cette réservation ne peut pas être payée"));
            }

            // Vérifier le montant
            if (!request.getAmount().equals(reservation.getPrixTotal())) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Montant incorrect"));
            }

            // Simuler l'intégration avec un service de paiement (Stripe, PayPal, etc.)
            // Dans un vrai projet, vous intégreriez ici votre service de paiement
            String transactionId = generateTransactionId();

            // Pour cette simulation, on considère que le paiement est immédiatement réussi
            // Dans la réalité, le client serait redirigé vers la plateforme de paiement

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("transactionId", transactionId);
            response.put("message", "Paiement initié avec succès");
            response.put("paymentUrl", null); // Pas de redirection pour cette simulation

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erreur lors de l'initiation du paiement: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de l'initiation du paiement"));
        }
    }

    // Confirmer un paiement
    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@Valid @RequestBody PaymentConfirmRequest request) {
        try {
            System.out.println("=== DEBUG CONFIRMATION PAIEMENT ===");
            System.out.println("Transaction ID: " + request.getTransactionId());
            System.out.println("Réservation ID: " + request.getReservationId());

            // Vérifier que la réservation existe
            Optional<Reservation> reservationOpt = reservationRepository.findById(request.getReservationId());
            if (!reservationOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Réservation non trouvée"));
            }

            Reservation reservation = reservationOpt.get();

            // Simuler la vérification du paiement auprès du service de paiement
            // Dans un vrai projet, vous vérifieriez le statut auprès de Stripe/PayPal/etc.
            boolean paymentSuccessful = verifyPaymentWithProvider(request.getTransactionId());

            if (!paymentSuccessful) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Le paiement a échoué ou n'a pas été trouvé"));
            }

            // Mettre à jour le statut de la réservation
            reservation.setStatut(Reservation.StatutReservation.CONFIRMEE);
            reservation.setDateModification(LocalDateTime.now());

            // Optionnel : enregistrer l'ID de transaction
            // reservation.setTransactionId(request.getTransactionId());
            // (nécessite d'ajouter ce champ à votre entité Reservation)

            Reservation updatedReservation = reservationRepository.save(reservation);

            // Envoyer email de confirmation (optionnel)
            // sendConfirmationEmail(updatedReservation);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Paiement confirmé avec succès");
            response.put("reservation", createReservationResponse(updatedReservation));

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erreur lors de la confirmation du paiement: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la confirmation du paiement"));
        }
    }

    // Vérifier le statut d'un paiement
    @GetMapping("/status/{transactionId}")
    public ResponseEntity<?> checkPaymentStatus(@PathVariable String transactionId) {
        try {
            // Simuler la vérification du statut auprès du service de paiement
            boolean paymentSuccessful = verifyPaymentWithProvider(transactionId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", paymentSuccessful);
            response.put("transactionId", transactionId);
            response.put("message", paymentSuccessful ? "Paiement réussi" : "Paiement en cours ou échoué");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la vérification du paiement"));
        }
    }

    // Méthodes utilitaires privées

    private String generateTransactionId() {
        // Génère un ID de transaction unique
        return "TXN_" + System.currentTimeMillis() + "_" + (int)(Math.random() * 10000);
    }

    private boolean verifyPaymentWithProvider(String transactionId) {
        // Simulation : dans un vrai projet, vous feriez une requête à votre service de paiement
        // Pour cette simulation, on considère que tous les paiements réussissent
        System.out.println("Vérification du paiement pour transaction: " + transactionId);

        // Simuler un délai de vérification
        try {
            Thread.sleep(500);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }

        return true; // Simuler un paiement réussi
    }

    private void sendConfirmationEmail(Reservation reservation) {
        // Implémentation de l'envoi d'email de confirmation
        System.out.println("Envoi d'email de confirmation à: " + reservation.getEmail());
        // Ici vous intégreriez votre service d'email (JavaMailSender, etc.)
    }

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

    // DTOs

    public static class PaymentRequest {
        private Long reservationId;
        private Double amount;
        private String currency;
        private String paymentMethod;

        // Getters et Setters
        public Long getReservationId() { return reservationId; }
        public void setReservationId(Long reservationId) { this.reservationId = reservationId; }

        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }

        public String getPaymentMethod() { return paymentMethod; }
        public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }
    }

    public static class PaymentConfirmRequest {
        private String transactionId;
        private Long reservationId;

        // Getters et Setters
        public String getTransactionId() { return transactionId; }
        public void setTransactionId(String transactionId) { this.transactionId = transactionId; }

        public Long getReservationId() { return reservationId; }
        public void setReservationId(Long reservationId) { this.reservationId = reservationId; }
    }
}