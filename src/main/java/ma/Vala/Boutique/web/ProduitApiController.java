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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:4200","http://localhost:63555"})
public class ProduitApiController {

    @Autowired
    private Cloudinary cloudinary;

    @Autowired
    private ProduitRepository produitRepository;

    @GetMapping("/produits")
    public ResponseEntity<Map<String, Object>> getAllProduits(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "4") int size,
            @RequestParam(name = "keyword", defaultValue = "") String keyword) {

        try {
            Page<Produit> produits = produitRepository.findByNomContainsIgnoreCase(keyword, PageRequest.of(page, size));

            Map<String, Object> response = new HashMap<>();
            response.put("produits", produits.getContent());
            response.put("currentPage", page);
            response.put("totalItems", produits.getTotalElements());
            response.put("totalPages", produits.getTotalPages());
            response.put("keyword", keyword);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération des produits");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Backend connecté avec succès!");
        response.put("timestamp", java.time.LocalDateTime.now().toString());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/produits/{id}")
    public ResponseEntity<Produit> getProduit(@PathVariable Long id) {
        Optional<Produit> produit = produitRepository.findById(id);
        return produit.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/produits-with-image")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> createProduitWithImage(
            @RequestParam("nom") String nom,
            @RequestParam("prix") double prix,
            @RequestParam("description") String description,
            @RequestParam("couleur") String couleur,
            @RequestParam("annee") Integer annee,
            @RequestParam("quantite") int quantite,
            @RequestParam("categorie") String categorie,
            @RequestParam("marque") String marque,
            @RequestParam("image") MultipartFile imageFile
    ) {
        try {
            // Upload vers Cloudinary
            Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.asMap(
                    "folder", "products",
                    "resource_type", "auto"
            ));
            String imageUrl = uploadResult.get("secure_url").toString();
            String publicId = uploadResult.get("public_id").toString();

            // Construire l'objet Produit (imageUrl + imagePublicId)
            Produit produit = Produit.builder()
                    .nom(nom)
                    .prix(prix)
                    .description(description)
                    .couleur(couleur)
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

    @PutMapping("/produits-with-image/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<?> updateProduitWithImage(
            @PathVariable Long id,
            @RequestParam("nom") String nom,
            @RequestParam("prix") double prix,
            @RequestParam("description") String description,
            @RequestParam("couleur") String couleur,
            @RequestParam(name = "annee", required = false) Integer annee,
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

            // Si nouvelle image fournie -> supprimer l'ancienne sur Cloudinary (si présent) puis uploader la nouvelle
            if (imageFile != null && !imageFile.isEmpty()) {
                if (existingProduct.getImagePublicId() != null) {
                    try {
                        cloudinary.uploader().destroy(existingProduct.getImagePublicId(), ObjectUtils.emptyMap());
                    } catch (Exception ex) {
                        // loger l'erreur mais continuer (on ne veut pas bloquer la mise à jour si suppression impossible)
                        System.out.println("Warning: impossible de supprimer l'ancienne image Cloudinary: " + ex.getMessage());
                    }
                }

                Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.asMap(
                        "folder", "products",
                        "resource_type", "auto"
                ));
                existingProduct.setImageUrl(uploadResult.get("secure_url").toString());
                existingProduct.setImagePublicId(uploadResult.get("public_id").toString());
            }

            // Mettre à jour les autres champs
            existingProduct.setNom(nom);
            existingProduct.setPrix(prix);
            existingProduct.setDescription(description);
            existingProduct.setCouleur(couleur.isEmpty() ? null : couleur);
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

    @PutMapping("/produits/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Produit> updateProduit(@PathVariable Long id, @Valid @RequestBody Produit produit) {
        Optional<Produit> existingProductOpt = produitRepository.findById(id);

        if (!existingProductOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Produit existingProduct = existingProductOpt.get();

        existingProduct.setNom(produit.getNom());
        existingProduct.setPrix(produit.getPrix());
        existingProduct.setDescription(produit.getDescription());
        existingProduct.setCouleur(produit.getCouleur());
        existingProduct.setAnnee(produit.getAnnee());
        existingProduct.setQuantite(produit.getQuantite());
        existingProduct.setCategorie(produit.getCategorie());
        existingProduct.setMarque(produit.getMarque());
        // Ne pas toucher imageUrl/imagePublicId ici.

        Produit updatedProduct = produitRepository.save(existingProduct);
        return ResponseEntity.ok(updatedProduct);
    }

    @DeleteMapping("/produits/{id}")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public ResponseEntity<Map<String, String>> deleteProduit(@PathVariable Long id) {
        try {
            Optional<Produit> productOpt = produitRepository.findById(id);

            if (!productOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }

            Produit product = productOpt.get();

            // 1) Supprimer l'image sur Cloudinary si on a le public_id
            if (product.getImagePublicId() != null) {
                try {
                    cloudinary.uploader().destroy(product.getImagePublicId(), ObjectUtils.emptyMap());
                } catch (Exception ex) {
                    System.out.println("Warning: impossible de supprimer l'image Cloudinary: " + ex.getMessage());
                }
            }

            // 2) Supprimer le produit en base
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

    // endpoint facultatif pour upload séparé (retourne URL + public_id)
    @PostMapping("/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile image) {
        try {
            Map uploadResult = cloudinary.uploader().upload(image.getBytes(), ObjectUtils.asMap(
                    "folder", "products",
                    "resource_type", "auto"
            ));
            Map<String, String> resp = new HashMap<>();
            resp.put("secure_url", uploadResult.get("secure_url").toString());
            resp.put("public_id", uploadResult.get("public_id").toString());
            return ResponseEntity.ok(resp);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Erreur lors de l'upload");
        }
    }
}