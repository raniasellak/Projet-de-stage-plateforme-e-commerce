package ma.Vala.Boutique.repository;

import ma.Vala.Boutique.entities.Produit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    // Recherche par nom (insensible à la casse)
    Page<Produit> findByNomContainsIgnoreCase(String nom, Pageable pageable);

    // Recherche par catégorie
    Page<Produit> findByCategorie(String categorie, Pageable pageable);

    // Recherche par marque
    Page<Produit> findByMarque(String marque, Pageable pageable);

    // Recherche avancée (optionnel)
    @Query("SELECT p FROM Produit p WHERE " +
            "LOWER(p.nom) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.marque) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.categorie) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Produit> findByKeywordInAllFields(@Param("keyword") String keyword, Pageable pageable);
}