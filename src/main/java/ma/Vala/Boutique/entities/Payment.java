package ma.Vala.Boutique.entities;

import jakarta.persistence.*;
import lombok.*;

import java.util.Date;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter@Setter@ToString @Builder

public class Payment {
    @Id@GeneratedValue(strategy = GenerationType.IDENTITY)

    private Long id;
    private PaymentType typePaiement  ;
    private double montant;
    private Date datePaiement;

    // Relation vers Client : chaque paiement appartient à un client
    @ManyToOne

    private Client client;

    // Relation vers Produit : chaque paiement correspond à une voiture
    @ManyToOne

    private Produit produit;

    private PaymentStatus status = PaymentStatus.CREATED;
     private String file;



}
