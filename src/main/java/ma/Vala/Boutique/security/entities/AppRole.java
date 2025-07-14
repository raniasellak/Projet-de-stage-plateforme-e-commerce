package ma.Vala.Boutique.security.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppRole {

    @Id
    private String role;  // Par exemple : "USER", "ADMIN"
}
