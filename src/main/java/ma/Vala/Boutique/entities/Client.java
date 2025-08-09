package ma.Vala.Boutique.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class Client {
@Id
    private Long id;
@Column(unique =true)
    private String cni;
    private String nom;           // Nom
    private String prenom;        // Prénom
    private String email;         // Email
    private String telephone;     // Téléphone

    private String image;


}
