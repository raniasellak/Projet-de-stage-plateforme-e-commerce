package ma.Vala.Boutique.repository;

import ma.Vala.Boutique.entities.Payment;
import ma.Vala.Boutique.entities.PaymentStatus;
import ma.Vala.Boutique.entities.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PaymentRepository extends JpaRepository<Payment , Long> {
    List<Payment> findByClient_Cni(String cni);

    List<Payment>findByStatus(PaymentStatus status);

    List<Payment> findByTypePaiement(PaymentType typePaiement);



}
