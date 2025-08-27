package ma.Vala.Boutique.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produit_id", nullable = false)
    private Produit produit;

    @NotNull(message = "La date de départ est obligatoire")
    @Column(name = "date_depart")
    private LocalDate dateDepart;

    @NotNull(message = "La date de retour est obligatoire")
    @Column(name = "date_retour")
    private LocalDate dateRetour;

    @NotEmpty(message = "Le nom est obligatoire")
    @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
    private String nom;

    @NotEmpty(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
    private String prenom;

    @NotEmpty(message = "Le téléphone est obligatoire")
    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Format de téléphone invalide")
    private String telephone;

    @NotEmpty(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    private String email;

    @NotEmpty(message = "Le lieu de prise est obligatoire")
    @Column(name = "lieu_prise")
    private String lieuPrise;

    @NotEmpty(message = "Le lieu de retour est obligatoire")
    @Column(name = "lieu_retour")
    private String lieuRetour;

    @Positive(message = "Le prix total doit être positif")
    @Column(name = "prix_total")
    private Double prixTotal;

    @Positive(message = "Le nombre de jours doit être positif")
    @Column(name = "nombre_jours")
    private Integer nombreJours;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private StatutReservation statut = StatutReservation.EN_ATTENTE;

    @Column(name = "date_creation")
    @Builder.Default
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_modification")
    private LocalDateTime dateModification;

    @Column(name = "transaction_id")
    private String transactionId;

    @Column(name = "payment_method")
    private String paymentMethod;

    @Column(name = "payment_status")
    private String paymentStatus;

    @PreUpdate
    protected void onUpdate() {
        dateModification = LocalDateTime.now();
    }

    // Enum pour le statut de réservation
    public enum StatutReservation {
        EN_ATTENTE("En attente"),
        CONFIRMEE("Confirmée"),
        EN_COURS("En cours"),
        TERMINEE("Terminée"),
        ANNULEE("Annulée");

        private final String label;

        StatutReservation(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }
}