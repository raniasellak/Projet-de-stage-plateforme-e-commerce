package ma.Vala.Boutique;

import ma.Vala.Boutique.entities.Produit;
import ma.Vala.Boutique.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BoutiqueApplication implements CommandLineRunner {

	@Autowired
	private ProduitRepository produitRepository;

	public static void main(String[] args) {
		SpringApplication.run(BoutiqueApplication.class, args);
	}

	@Override
	public void run(String... args) throws Exception {
		if (produitRepository.count() == 0) {
			// 3. Produit avec Builder (Lombok)
			Produit p1 = Produit.builder()
					.nom("Model 3")
					.description("Tesla électrique, 2023")
					.prix(1000000)
					.quantite(1)
					.categorie("Voiture")
					.marque("Tesla")
					.build();

			Produit p2 = Produit.builder()
					.nom("G class")
					.description("Tres bonne etat")
					.prix(1000000)
					.quantite(2)
					.categorie("Voiture")
					.marque("mercedes")
					.build();
			produitRepository.save(p2);
			produitRepository.save(p1);
		}
	}
}