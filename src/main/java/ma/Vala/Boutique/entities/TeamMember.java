package ma.Vala.Boutique.entities;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "team_members")
@Data
@NoArgsConstructor
@AllArgsConstructor

public class TeamMember {@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(min = 2, max = 50, message = "Le prénom doit contenir entre 2 et 50 caractères")
    @Column(name = "first_name", nullable = false)
    private String firstName;

    @NotBlank(message = "Le nom est obligatoire")
    @Size(min = 2, max = 50, message = "Le nom doit contenir entre 2 et 50 caractères")
    @Column(name = "last_name", nullable = false)
    private String lastName;

    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Format d'email invalide")
    @Column(name = "email", nullable = false, unique = true)
    private String email;

    @NotBlank(message = "Le numéro de téléphone est obligatoire")
    @Pattern(regexp = "^[+]?[0-9\\s\\-()]{10,20}$", message = "Numéro de téléphone invalide")
    @Column(name = "phone_number")
    private String phoneNumber;

    @NotBlank(message = "Le poste est obligatoire")
    @Column(name = "position", nullable = false)
    private String position;

    @Enumerated(EnumType.STRING)
    @Column(name = "department", nullable = false)
    private Department department;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_status", nullable = false)
    private EmploymentStatus employmentStatus;

    @DecimalMin(value = "0.0", message = "Le salaire ne peut pas être négatif")
    @Column(name = "salary")
    private Double salary;

    @Column(name = "hire_date")
    private LocalDateTime hireDate;

    @Column(name = "address")
    private String address;

    @Column(name = "city")
    private String city;

    @Column(name = "postal_code")
    private String postalCode;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "image_url")
    private String imageUrl; // chemin ou URL de l'image

    @Column(columnDefinition = "TEXT")
    private String description; // présentation du membre

    // Énumérations
    public enum Department {
        ADMINISTRATION("Administration"),
        VENTES("Ventes"),
        MAINTENANCE("Maintenance"),
        COMPTABILITE("Comptabilité"),
        MARKETING("Marketing"),
        RH("Ressources Humaines"),
        SECURITE("Sécurité");

        private final String displayName;

        Department(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }

    public enum EmploymentStatus {
        CDI("CDI"),
        CDD("CDD"),
        STAGE("Stage"),
        FREELANCE("Freelance"),
        TEMPS_PARTIEL("Temps Partiel");

        private final String displayName;

        EmploymentStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
