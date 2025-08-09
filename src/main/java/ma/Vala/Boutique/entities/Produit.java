package ma.Vala.Boutique.entities;


import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Entity
@Table(name = "produits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotEmpty(message = "Le nom ne doit pas être vide")
    @Size(min = 4, max = 40, message = "Le nom doit contenir entre 4 et 40 caractères")
    private String nom;

    @Positive(message = "Le prix doit être un nombre positif")
    private double prix;

    @NotBlank(message = "La description ne doit pas être vide")
    @Size(max = 255, message = "La description ne doit pas dépasser 255 caractères")
    private String description;

    private String couleur;

    private Integer annee;

    @Min(value = 0, message = "La quantité ne peut pas être négative")
    private int quantite;

    @NotBlank(message = "La catégorie est obligatoire")
    @Size(max = 50, message = "La catégorie ne doit pas dépasser 50 caractères")
    private String categorie;

    @NotBlank(message = "La marque est obligatoire")
    @Size(max = 50, message = "La marque ne doit pas dépasser 50 caractères")
    private String marque;

    @Column(name = "image_url")
    private String imageUrl;

    @Column(name = "image_public_id")
    private String imagePublicId;

}