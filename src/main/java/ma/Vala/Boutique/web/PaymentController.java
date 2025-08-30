package ma.Vala.Boutique.web;

import jakarta.validation.Valid;
import ma.Vala.Boutique.entities.Reservation;
import ma.Vala.Boutique.entities.Produit;
import ma.Vala.Boutique.repository.ReservationRepository;
import ma.Vala.Boutique.repository.ProduitRepository;
import ma.Vala.Boutique.service.PayPalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:49902"})
public class PaymentController {

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ProduitRepository produitRepository;

    @Autowired
    private PayPalService payPalService;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    // Initier un paiement PayPal
    @PostMapping("/initiate-paypal")
    public ResponseEntity<?> initiatePayPalPayment(@Valid @RequestBody PayPalPaymentRequest request) {
        try {
            System.out.println("=== DEBUG INITIATION PAIEMENT PAYPAL ===");
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

            // URLs de retour PayPal
            String returnUrl = frontendBaseUrl + "/payment-success?reservationId=" + reservation.getId();
            String cancelUrl = frontendBaseUrl + "/payment-cancel?reservationId=" + reservation.getId();

            // Description du paiement
            String description = String.format("Location %s - %s (%d jours)",
                    reservation.getProduit().getMarque(),
                    reservation.getProduit().getNom(),
                    reservation.getNombreJours());

            // Créer le paiement PayPal
            Map<String, Object> paypalResponse = payPalService.createPayment(
                    request.getAmount(),
                    "EUR",
                    returnUrl,
                    cancelUrl,
                    description
            );

            // Sauvegarder l'ID PayPal dans la réservation
            reservation.setTransactionId((String) paypalResponse.get("id"));
            reservation.setPaymentMethod("PAYPAL");
            reservation.setPaymentStatus("PENDING");
            reservationRepository.save(reservation);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("paypalOrderId", paypalResponse.get("id"));
            response.put("approvalUrl", paypalResponse.get("approvalUrl"));
            response.put("message", "Paiement PayPal créé avec succès");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            System.err.println("Erreur lors de l'initiation du paiement PayPal: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de l'initiation du paiement PayPal"));
        }
    }

    // Capturer le paiement PayPal après approbation
    @PostMapping("/capture-paypal/{orderId}")
    public ResponseEntity<?> capturePayPalPayment(@PathVariable String orderId) {
        try {
            System.out.println("=== DEBUG CAPTURE PAIEMENT PAYPAL ===");
            System.out.println("Order ID: " + orderId);

            // Trouver la réservation avec cet orderId
            Optional<Reservation> reservationOpt = reservationRepository.findByTransactionId(orderId);
            if (!reservationOpt.isPresent()) {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Réservation non trouvée pour cette transaction"));
            }

            Reservation reservation = reservationOpt.get();

            // Capturer le paiement chez PayPal
            Map<String, Object> captureResponse = payPalService.capturePayment(orderId);

            if ("COMPLETED".equals(captureResponse.get("status"))) {
                // Mettre à jour la réservation
                reservation.setStatut(Reservation.StatutReservation.CONFIRMEE);
                reservation.setPaymentStatus("COMPLETED");
                reservation.setDateModification(LocalDateTime.now());

                Reservation updatedReservation = reservationRepository.save(reservation);

                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Paiement PayPal confirmé avec succès");
                response.put("reservation", createReservationResponse(updatedReservation));

                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                        .body(createErrorResponse("Le paiement PayPal n'a pas été complété"));
            }

        } catch (Exception e) {
            System.err.println("Erreur lors de la capture du paiement PayPal: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la capture du paiement PayPal"));
        }
    }

    // Vérifier le statut d'un paiement PayPal
    @GetMapping("/status-paypal/{orderId}")
    public ResponseEntity<?> checkPayPalPaymentStatus(@PathVariable String orderId) {
        try {
            Map<String, Object> paypalStatus = payPalService.getPaymentDetails(orderId);
            return ResponseEntity.ok(paypalStatus);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de la vérification du paiement PayPal"));
        }
    }

    // Gérer l'annulation PayPal
    @PostMapping("/cancel-paypal")
    public ResponseEntity<?> cancelPayPalPayment(@RequestBody Map<String, Object> request) {
        try {
            Long reservationId = Long.valueOf(request.get("reservationId").toString());

            Optional<Reservation> reservationOpt = reservationRepository.findById(reservationId);
            if (reservationOpt.isPresent()) {
                Reservation reservation = reservationOpt.get();
                reservation.setPaymentStatus("CANCELLED");
                reservationRepository.save(reservation);
            }

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Paiement annulé");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse("Erreur lors de l'annulation"));
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

    // DTOs
    public static class PayPalPaymentRequest {
        private Long reservationId;
        private Double amount;
        private String currency = "EUR";

        public Long getReservationId() { return reservationId; }
        public void setReservationId(Long reservationId) { this.reservationId = reservationId; }

        public Double getAmount() { return amount; }
        public void setAmount(Double amount) { this.amount = amount; }

        public String getCurrency() { return currency; }
        public void setCurrency(String currency) { this.currency = currency; }
    }
}