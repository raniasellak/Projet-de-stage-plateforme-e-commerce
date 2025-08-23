package ma.Vala.Boutique.web;

import jakarta.validation.Valid;
import ma.Vala.Boutique.entities.Produit;
import ma.Vala.Boutique.repository.ProduitRepository;
import ma.Vala.Boutique.cloudinary.CloudinaryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:4200","http://localhost:54798"})
public class ProduitApiController {

    @Autowired
    private CloudinaryService cloudinaryService;

    @Autowired
    private ProduitRepository produitRepository;

    // Test de connexion Cloudinary
    @GetMapping("/cloudinary-test")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> testCloudinaryConnection() {
        try {
            boolean isConnected = cloudinaryService.testConnection();
            Map<String, Object> response = new HashMap<>();
            response.put("connected", isConnected);
            response.put("message", isConnected ? "Cloudinary connection OK" : "Cloudinary connection failed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("connected", false);
            response.put("message", "Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Créer un produit avec image - VERSION CORRIGÉE
    @PostMapping("/produits-with-image")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createProduitWithImage(
            @RequestParam("nom") String nom,
            @RequestParam("prix") String prix,
            @RequestParam("description") String description,
            @RequestParam(value = "couleur", required = false, defaultValue = "") String couleur,
            @RequestParam(value = "annee", required = false) String annee,
            @RequestParam("quantite") String quantite,
            @RequestParam("categorie") String categorie,
            @RequestParam("marque") String marque,
            @RequestParam("image") MultipartFile imageFile
    ) {
        try {
            System.out.println("=== DEBUG CRÉATION PRODUIT ===");
            System.out.println("Nom: " + nom);
            System.out.println("Prix: " + prix);
            System.out.println("Description: " + description);
            System.out.println("Couleur: " + couleur);
            System.out.println("Année: " + annee);
            System.out.println("Quantité: " + quantite);
            System.out.println("Catégorie: " + categorie);
            System.out.println("Marque: " + marque);
            System.out.println("Image file: " + (imageFile != null ? imageFile.getOriginalFilename() : "null"));

            // Validation basique
            if (nom == null || nom.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Le nom est requis");
            }
            if (imageFile == null || imageFile.isEmpty()) {
                return ResponseEntity.badRequest().body("Image requise");
            }

            // Validation de l'image
            if (imageFile.getSize() > 10 * 1024 * 1024) { // 10MB max
                return ResponseEntity.badRequest().body("L'image ne doit pas dépasser 10MB");
            }

            // Conversion et validation des types numériques
            double prixValue;
            int quantiteValue;
            Integer anneeValue = null;

            try {
                prixValue = Double.parseDouble(prix);
                quantiteValue = Integer.parseInt(quantite);
                if (annee != null && !annee.trim().isEmpty() && !"null".equals(annee)) {
                    anneeValue = Integer.parseInt(annee);
                }
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Format de nombre invalide: " + e.getMessage());
            }

            // Validation des valeurs
            if (prixValue <= 0) {
                return ResponseEntity.badRequest().body("Le prix doit être supérieur à 0");
            }
            if (quantiteValue < 0) {
                return ResponseEntity.badRequest().body("La quantité ne peut pas être négative");
            }

            // Upload vers Cloudinary en utilisant le service
            Map<String, Object> uploadResult = cloudinaryService.uploadFile(imageFile, "products");

            String imageUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            // Construire l'objet Produit
            Produit produit = Produit.builder()
                    .nom(nom.trim())
                    .prix(prixValue)
                    .description(description.trim())
                    .couleur(couleur != null && !couleur.trim().isEmpty() && !"null".equals(couleur) ? couleur.trim() : null)
                    .annee(anneeValue)
                    .quantite(quantiteValue)
                    .categorie(categorie.trim())
                    .marque(marque.trim())
                    .imageUrl(imageUrl)
                    .imagePublicId(publicId)
                    .build();

            System.out.println("Produit construit: " + produit);

            Produit saved = produitRepository.save(produit);
            System.out.println("Produit sauvegardé avec ID: " + saved.getId());

            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (IOException e) {
            System.err.println("Erreur Cloudinary: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur Cloudinary lors de l'upload : " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Erreur générale: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur : " + e.getMessage());
        }
    }

    // Modifier un produit avec nouvelle image
    @PutMapping("/produits-with-image/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateProduitWithImage(
            @PathVariable Long id,
            @RequestParam("nom") String nom,
            @RequestParam("prix") String prix,
            @RequestParam("description") String description,
            @RequestParam(value = "couleur", required = false, defaultValue = "") String couleur,
            @RequestParam(value = "annee", required = false) String annee,
            @RequestParam("quantite") String quantite,
            @RequestParam("categorie") String categorie,
            @RequestParam("marque") String marque,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            System.out.println("=== DEBUG MODIFICATION PRODUIT ===");
            System.out.println("ID: " + id);

            Optional<Produit> existingProductOpt = produitRepository.findById(id);
            if (!existingProductOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Produit existingProduct = existingProductOpt.get();

            // Conversion des types numériques
            double prixValue;
            int quantiteValue;
            Integer anneeValue = null;

            try {
                prixValue = Double.parseDouble(prix);
                quantiteValue = Integer.parseInt(quantite);
                if (annee != null && !annee.trim().isEmpty() && !"null".equals(annee)) {
                    anneeValue = Integer.parseInt(annee);
                }
            } catch (NumberFormatException e) {
                return ResponseEntity.badRequest().body("Format de nombre invalide: " + e.getMessage());
            }

            // Si nouvelle image fournie
            if (imageFile != null && !imageFile.isEmpty()) {
                // Validation de l'image
                if (imageFile.getSize() > 10 * 1024 * 1024) {
                    return ResponseEntity.badRequest().body("L'image ne doit pas dépasser 10MB");
                }

                // Supprimer l'ancienne image
                if (existingProduct.getImagePublicId() != null) {
                    try {
                        cloudinaryService.deleteFile(existingProduct.getImagePublicId());
                    } catch (Exception e) {
                        System.err.println("Erreur lors de la suppression de l'ancienne image: " + e.getMessage());
                    }
                }

                // Upload nouvelle image
                Map<String, Object> uploadResult = cloudinaryService.uploadFile(imageFile, "products");
                existingProduct.setImageUrl(uploadResult.get("secure_url").toString());
                existingProduct.setImagePublicId(uploadResult.get("public_id").toString());
            }

            // Mettre à jour les autres champs
            existingProduct.setNom(nom.trim());
            existingProduct.setPrix(prixValue);
            existingProduct.setDescription(description.trim());
            existingProduct.setCouleur(couleur != null && !couleur.trim().isEmpty() && !"null".equals(couleur) ? couleur.trim() : null);
            existingProduct.setAnnee(anneeValue);
            existingProduct.setQuantite(quantiteValue);
            existingProduct.setCategorie(categorie.trim());
            existingProduct.setMarque(marque.trim());

            Produit updatedProduct = produitRepository.save(existingProduct);
            return ResponseEntity.ok(updatedProduct);

        } catch (IOException e) {
            System.err.println("Erreur Cloudinary: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur Cloudinary lors de l'upload : " + e.getMessage());
        } catch (Exception e) {
            System.err.println("Erreur lors de la modification: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la modification : " + e.getMessage());
        }
    }

    // Reste des méthodes... (getAllProduits, getProduit, etc.)
    @GetMapping("/produits")
    public ResponseEntity<Map<String, Object>> getAllProduits(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "keyword", defaultValue = "") String keyword) {

        try {
            Page<Produit> produitPage;

            if (keyword.isEmpty()) {
                produitPage = produitRepository.findAll(PageRequest.of(page, size));
            } else {
                produitPage = produitRepository.findByNomContainsIgnoreCase(keyword, PageRequest.of(page, size));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("produits", produitPage.getContent());
            response.put("totalItems", produitPage.getTotalElements());
            response.put("totalPages", produitPage.getTotalPages());
            response.put("currentPage", page);
            response.put("pageSize", size);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Erreur lors de la récupération des produits: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/produits/{id}")
    public ResponseEntity<Produit> getProduit(@PathVariable Long id) {
        Optional<Produit> produit = produitRepository.findById(id);
        if (produit.isPresent()) {
            return ResponseEntity.ok(produit.get());
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/produits/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteProduit(@PathVariable Long id) {
        try {
            Optional<Produit> productOpt = produitRepository.findById(id);

            if (!productOpt.isPresent()) {
                Map<String, String> response = new HashMap<>();
                response.put("success", "false");
                response.put("message", "Produit non trouvé");
                return ResponseEntity.notFound().build();
            }

            Produit product = productOpt.get();

            // Supprimer l'image de Cloudinary si elle existe
            if (product.getImagePublicId() != null) {
                try {
                    cloudinaryService.deleteFile(product.getImagePublicId());
                } catch (Exception e) {
                    System.err.println("Erreur lors de la suppression de l'image Cloudinary: " + e.getMessage());
                }
            }

            produitRepository.deleteById(id);

            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("message", "Produit supprimé avec succès");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("message", "Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Modifier un produit SANS changer l'image (JSON)
    @PutMapping("/produits/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateProduit(
            @PathVariable Long id,
            @RequestBody Produit produitData
    ) {
        try {
            System.out.println("=== DEBUG MODIFICATION PRODUIT SANS IMAGE ===");
            System.out.println("ID: " + id);
            System.out.println("Données reçues: " + produitData);

            Optional<Produit> existingProductOpt = produitRepository.findById(id);
            if (!existingProductOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Produit existingProduct = existingProductOpt.get();

            // Mettre à jour uniquement les champs fournis (garde l'image actuelle)
            if (produitData.getNom() != null) {
                existingProduct.setNom(produitData.getNom().trim());
            }
            if (produitData.getPrix() != null) {
                existingProduct.setPrix(produitData.getPrix());
            }
            if (produitData.getDescription() != null) {
                existingProduct.setDescription(produitData.getDescription().trim());
            }
            if (produitData.getCouleur() != null) {
                existingProduct.setCouleur(produitData.getCouleur().trim().isEmpty() ? null : produitData.getCouleur().trim());
            }
            if (produitData.getAnnee() != null) {
                existingProduct.setAnnee(produitData.getAnnee());
            }
            if (produitData.getQuantite() != null) {
                existingProduct.setQuantite(produitData.getQuantite());
            }
            if (produitData.getCategorie() != null) {
                existingProduct.setCategorie(produitData.getCategorie().trim());
            }
            if (produitData.getMarque() != null) {
                existingProduct.setMarque(produitData.getMarque().trim());
            }

            // L'image reste inchangée
            Produit updatedProduct = produitRepository.save(existingProduct);
            return ResponseEntity.ok(updatedProduct);

        } catch (Exception e) {
            System.err.println("Erreur lors de la modification sans image: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la modification : " + e.getMessage());
        }
    }

    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API fonctionne correctement !");
    }
}