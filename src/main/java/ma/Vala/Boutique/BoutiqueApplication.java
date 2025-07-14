package ma.Vala.Boutique;

import ma.Vala.Boutique.entities.Produit;
import ma.Vala.Boutique.repository.ProduitRepository;
import ma.Vala.Boutique.security.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.JdbcUserDetailsManager;

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
					.description("Très bon état")
					.prix(1000000)
					.quantite(2)
					.categorie("Voiture")
					.marque("Mercedes")
					.build();

			produitRepository.save(p1);
			produitRepository.save(p2);
		}
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	//@Bean
	public CommandLineRunner commandeLineRuner(JdbcUserDetailsManager jdbcUserDetailsManager) {
		return args -> {
			PasswordEncoder encoder = passwordEncoder();

			if (!jdbcUserDetailsManager.userExists("user11")) {
				jdbcUserDetailsManager.createUser(
						User.withUsername("user11")
								.password(encoder.encode("1234"))
								.roles("USER")
								.build()
				);
			}

			if (!jdbcUserDetailsManager.userExists("user22")) {
				jdbcUserDetailsManager.createUser(
						User.withUsername("user22")
								.password(encoder.encode("1234"))
								.roles("USER")
								.build()
				);
			}

			if (!jdbcUserDetailsManager.userExists("admin2")) {
				jdbcUserDetailsManager.createUser(
						User.withUsername("admin2")
								.password(encoder.encode("1234"))
								.roles("USER", "ADMIN")
								.build()
				);
			}
		};
	}

	//@Bean
	public CommandLineRunner commandLineRunnerUserDetails(AccountService accountService) {
		return args -> {
			accountService.addNewRole("USER");
			accountService.addNewRole("ADMIN");
			accountService.addNewUser("user1", "1234", "user1@gmail.com", "1234");
			accountService.addNewUser("user2", "1234", "user2@gmail.com", "1234");
			accountService.addNewUser("admin", "1234", "admin@gmail.com", "1234");

			accountService.addRoleToUser("user1", "USER");
			accountService.addRoleToUser("user2", "USER");
			accountService.addRoleToUser("admin", "USER");
			accountService.addRoleToUser("admin", "ADMIN");
		};
	}
}