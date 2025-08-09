package ma.Vala.Boutique.dtos;

import lombok.*;
import ma.Vala.Boutique.entities.Client;
import ma.Vala.Boutique.entities.PaymentStatus;
import ma.Vala.Boutique.entities.PaymentType;
import ma.Vala.Boutique.entities.Produit;

import java.util.Date;

@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class PaymentDTO {

    private Long id;
    private PaymentType typePaiement;
    private double montant;
    private Date datePaiement;

    private PaymentStatus status = PaymentStatus.CREATED;

    private Client client;
    private Produit produit;
    private String file;

}
