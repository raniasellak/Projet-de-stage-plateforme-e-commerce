package ma.Vala.Boutique.repository;

import ma.Vala.Boutique.entities.Produit;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;

public interface ProduitRepository extends JpaRepository<Produit,Long> {

    Page<Produit> findByNomContainsIgnoreCase(String nom ,  Pageable pageable );
}
