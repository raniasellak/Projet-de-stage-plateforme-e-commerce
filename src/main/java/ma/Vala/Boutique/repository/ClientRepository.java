package ma.Vala.Boutique.repository;

import ma.Vala.Boutique.entities.Client;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ClientRepository extends JpaRepository<Client, Long>
{
    Client findByCni(String cni);
}
