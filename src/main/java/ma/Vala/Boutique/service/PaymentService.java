package ma.Vala.Boutique.service;


import jakarta.transaction.Transactional;
import ma.Vala.Boutique.entities.Client;
import ma.Vala.Boutique.entities.Payment;
import ma.Vala.Boutique.entities.PaymentStatus;
import ma.Vala.Boutique.entities.PaymentType;
import ma.Vala.Boutique.repository.ClientRepository;
import ma.Vala.Boutique.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import java.nio.file.StandardCopyOption;
import java.util.Date;
import java.util.UUID;

@Service
@Transactional
public class PaymentService {

    private PaymentRepository paymentRepository;


    private ClientRepository clientRepository;

    public PaymentService(PaymentRepository paymentRepository, ClientRepository clientRepository){
        this.paymentRepository = paymentRepository;
        this.clientRepository = clientRepository;
    }
    public Payment savePayment(MultipartFile file, Date datePaiement, double montant, PaymentType typePaiement, String cni) throws IOException {
        // 1. Chemin du dossier où on va enregistrer le fichier
        Path path = Paths.get("D:/Boutique_Springboot/payments");
        System.out.println("📁 Dossier de sauvegarde : " + path.toAbsolutePath());

        // 2. Créer le dossier s’il n’existe pas
        if (!Files.exists(path)) {
            Files.createDirectories(path);
            System.out.println("✅ Dossier créé !");
        }

        // 3. Générer un nom unique pour le fichier
        String fileId = UUID.randomUUID().toString();
        Path filePath = path.resolve(fileId + ".pdf");

        // 4. Copier le fichier dans le dossier (même si un fichier du même nom existe)
        Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
        System.out.println("✅ Fichier enregistré à : " + filePath.toAbsolutePath());

        // 5. Trouver le client dans la base de données
        Client client = clientRepository.findByCni(cni);
        if (client == null) {
            throw new RuntimeException("❌ Client non trouvé !");
        }

        // 6. Créer l'objet Payment
        Payment payment = Payment.builder()
                .datePaiement(datePaiement)
                .typePaiement(typePaiement)
                .montant(montant)
                .client(client)
                .status(PaymentStatus.CREATED)
                .file(filePath.toAbsolutePath().toString()) // Chemin réel du fichier
                .build();

        // 7. Enregistrer le paiement dans la base
        return paymentRepository.save(payment);
    }



}
