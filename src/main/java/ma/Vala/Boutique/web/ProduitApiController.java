package ma.Vala.Boutique.web;

import jakarta.validation.Valid;
import ma.Vala.Boutique.entities.Produit;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import ma.Vala.Boutique.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
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
@CrossOrigin(origins = {"http://localhost:4200","http://localhost:55832"})
public class ProduitApiController {

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private ProduitRepository produitRepository;

    // Récupérer tous les produits avec pagination et recherche
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

    // Récupérer un produit par ID
    @GetMapping("/produits/{id}")
    public ResponseEntity<Produit> getProduit(@PathVariable Long id) {
        Optional<Produit> produit = produitRepository.findById(id);
        if (produit.isPresent()) {
            return ResponseEntity.ok(produit.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Créer un produit avec image
    @PostMapping("/produits-with-image")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createProduitWithImage(
            @RequestParam("nom") String nom,
            @RequestParam("prix") double prix,
            @RequestParam("description") String description,
            @RequestParam(value = "couleur", required = false) String couleur,
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam("quantite") int quantite,
            @RequestParam("categorie") String categorie,
            @RequestParam("marque") String marque,
            @RequestParam("image") MultipartFile imageFile
    ) {
        try {
            // Validation basique
            if (imageFile.isEmpty()) {
                return ResponseEntity.badRequest().body("Image requise");
            }

            // Upload vers Cloudinary
            Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.asMap(
                    "folder", "products",
                    "resource_type", "auto",
                    "transformation", ObjectUtils.asMap("quality", "auto", "fetch_format", "auto")
            ));

            String imageUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            // Construire l'objet Produit
            Produit produit = Produit.builder()
                    .nom(nom)
                    .prix(prix)
                    .description(description)
                    .couleur(couleur != null && !couleur.trim().isEmpty() ? couleur : null)
                    .annee(annee)
                    .quantite(quantite)
                    .categorie(categorie)
                    .marque(marque)
                    .imageUrl(imageUrl)
                    .imagePublicId(publicId)
                    .build();

            Produit saved = produitRepository.save(produit);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur Cloudinary lors de l'upload : " + e.getMessage());
        } catch (Exception e) {
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
            @RequestParam("prix") double prix,
            @RequestParam("description") String description,
            @RequestParam(value = "couleur", required = false) String couleur,
            @RequestParam(value = "annee", required = false) Integer annee,
            @RequestParam("quantite") int quantite,
            @RequestParam("categorie") String categorie,
            @RequestParam("marque") String marque,
            @RequestParam(value = "image", required = false) MultipartFile imageFile
    ) {
        try {
            Optional<Produit> existingProductOpt = produitRepository.findById(id);
            if (!existingProductOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Produit existingProduct = existingProductOpt.get();

            // Si nouvelle image fournie
            if (imageFile != null && !imageFile.isEmpty()) {
                // Upload nouvelle image vers Cloudinary
                Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.asMap(
                        "folder", "products",
                        "resource_type", "auto",
                        "transformation", ObjectUtils.asMap("quality", "auto", "fetch_format", "auto")
                ));
                // Mettre à jour l'URL et public_id
                existingProduct.setImageUrl(uploadResult.get("secure_url").toString());
                existingProduct.setImagePublicId(uploadResult.get("public_id").toString());
            }

            // Mettre à jour les autres champs
            existingProduct.setNom(nom);
            existingProduct.setPrix(prix);
            existingProduct.setDescription(description);
            existingProduct.setCouleur(couleur != null && !couleur.trim().isEmpty() ? couleur : null);
            existingProduct.setAnnee(annee);
            existingProduct.setQuantite(quantite);
            existingProduct.setCategorie(categorie);
            existingProduct.setMarque(marque);

            Produit updatedProduct = produitRepository.save(existingProduct);
            return ResponseEntity.ok(updatedProduct);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur Cloudinary lors de l'upload : " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de la modification : " + e.getMessage());
        }
    }

    // Modifier un produit sans changer l'image
    @PutMapping("/produits/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Produit> updateProduit(@PathVariable Long id, @Valid @RequestBody Produit produit) {
        Optional<Produit> existingProductOpt = produitRepository.findById(id);

        if (!existingProductOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Produit existingProduct = existingProductOpt.get();

        // Mettre à jour seulement les champs modifiables (pas l'image)
        existingProduct.setNom(produit.getNom());
        existingProduct.setPrix(produit.getPrix());
        existingProduct.setDescription(produit.getDescription());
        existingProduct.setCouleur(produit.getCouleur());
        existingProduct.setAnnee(produit.getAnnee());
        existingProduct.setQuantite(produit.getQuantite());
        existingProduct.setCategorie(produit.getCategorie());
        existingProduct.setMarque(produit.getMarque());
        // imageUrl et imagePublicId restent inchangés

        Produit updatedProduct = produitRepository.save(existingProduct);
        return ResponseEntity.ok(updatedProduct);
    }

    // Supprimer un produit
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

            // Supprimer seulement de la base de données
            // (les images restent sur Cloudinary comme demandé)
            produitRepository.deleteById(id);

            Map<String, String> response = new HashMap<>();
            response.put("success", "true");
            response.put("message", "Produit supprimé avec succès de la base de données");
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, String> response = new HashMap<>();
            response.put("success", "false");
            response.put("message", "Erreur lors de la suppression: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    // Endpoint pour upload d'image séparé (optionnel)
    @PostMapping("/upload")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile image) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest().body("Aucune image fournie");
            }

            Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap(
                    "folder", "products",
                    "resource_type", "auto",
                    "transformation", ObjectUtils.asMap("quality", "auto", "fetch_format", "auto")
            ));

            Map<String, String> response = new HashMap<>();
            response.put("secure_url", uploadResult.get("secure_url").toString());
            response.put("public_id", uploadResult.get("public_id").toString());
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Erreur lors de l'upload : " + e.getMessage());
        }
    }

    // Endpoint de test
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API fonctionne correctement !");
    }
}