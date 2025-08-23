package ma.Vala.Boutique.web;

import ma.Vala.Boutique.entities.Client;
import ma.Vala.Boutique.entities.Payment;
import ma.Vala.Boutique.entities.PaymentStatus;
import ma.Vala.Boutique.entities.PaymentType;
import ma.Vala.Boutique.repository.ClientRepository;
import ma.Vala.Boutique.repository.PaymentRepository;
import ma.Vala.Boutique.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.SimpleDateFormat;
import java.util.*;

@RestController
@CrossOrigin(origins = {"http://localhost:4200","http://localhost:55492"})
@RequestMapping("/api")
public class ClientRestController {

    private final PaymentRepository paymentRepository;
    private final ClientRepository clientRepository;
    private final PaymentService paymentService;

    public ClientRestController(PaymentRepository paymentRepository, ClientRepository clientRepository, PaymentService paymentService) {
        this.paymentRepository = paymentRepository;
        this.clientRepository = clientRepository;
        this.paymentService = paymentService;
    }

    // ✅ AMÉLIORATION: Retourner ResponseEntity avec gestion d'erreurs
    @GetMapping("/payments")
    public ResponseEntity<Map<String, Object>> allPayments() {
        try {
            List<Payment> payments = paymentRepository.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", payments);
            response.put("totalItems", payments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération des paiements");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/payments/byType")
    public ResponseEntity<Map<String, Object>> paymentsByType(@RequestParam PaymentType type) {
        try {
            List<Payment> payments = paymentRepository.findByTypePaiement(type);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", payments);
            response.put("type", type);
            response.put("totalItems", payments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération des paiements par type");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/payments/byStatus")
    public ResponseEntity<Map<String, Object>> paymentsByStatus(@RequestParam PaymentStatus status) {
        try {
            List<Payment> payments = paymentRepository.findByStatus(status);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", payments);
            response.put("status", status);
            response.put("totalItems", payments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération des paiements par statut");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<Payment> findPaymentById(@PathVariable Long id) {
        try {
            Payment payment = paymentRepository.findById(id).orElseThrow(
                    () -> new RuntimeException("Paiement avec ID " + id + " introuvable")
            );
            return ResponseEntity.ok(payment);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ✅ AMÉLIORATION: Gestion d'erreurs pour les clients
    @GetMapping("/clients")
    public ResponseEntity<Map<String, Object>> allClients() {
        try {
            List<Client> clients = clientRepository.findAll();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("clients", clients);
            response.put("totalItems", clients.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération des clients");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    @GetMapping("/clients/{id}")
    public ResponseEntity<Client> findClientById(@PathVariable Long id) {
        try {
            Client client = clientRepository.findById(id).orElseThrow(
                    () -> new RuntimeException("Client avec ID " + id + " introuvable")
            );
            return ResponseEntity.ok(client);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/clients/{cni}/payments")
    public ResponseEntity<Map<String, Object>> findByClientCni(@PathVariable String cni) {
        try {
            List<Payment> payments = paymentRepository.findByClient_Cni(cni);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("payments", payments);
            response.put("cni", cni);
            response.put("totalItems", payments.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la récupération des paiements du client");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }

    // ✅ ENDPOINT DE TEST pour vérifier la connexion
    @GetMapping("/test-payments")
    public ResponseEntity<Map<String, String>> testPayments() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Endpoint payments accessible!");
        response.put("timestamp", new Date().toString());
        return ResponseEntity.ok(response);
    }

    @PostMapping(value = "/payments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Map<String, Object>> savePayment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("datePaiement") String datePaiement,
            @RequestParam("montant") double montant,
            @RequestParam("typePaiement") PaymentType typePaiement,
            @RequestParam("cni") String cni) {

        try {
            System.out.println("=== DONNÉES REÇUES ===");
            System.out.println("Fichier : " + file.getOriginalFilename());
            System.out.println("Date : " + datePaiement);
            System.out.println("Montant : " + montant);
            System.out.println("Type : " + typePaiement);
            System.out.println("CNI : " + cni);

            SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd");
            Date parsedDate = formatter.parse(datePaiement);

            Payment savedPayment = paymentService.savePayment(file, parsedDate, montant, typePaiement, cni);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Paiement créé avec succès");
            response.put("payment", savedPayment);

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la création du paiement");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }

    @GetMapping(value = "/paymentFile/{paymentId}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> getPaymentFile(@PathVariable Long paymentId) {
        try {
            Payment payment = paymentRepository.findById(paymentId).orElseThrow(
                    () -> new RuntimeException("Paiement introuvable")
            );
            String filePath = payment.getFile();
            byte[] fileContent = Files.readAllBytes(Path.of(URI.create(filePath)));
            return ResponseEntity.ok(fileContent);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/payments/updateStatus/{paymentId}")
    public ResponseEntity<Map<String, Object>> updatePaymentStatus(
            @RequestParam PaymentStatus status,
            @PathVariable Long paymentId) {
        try {
            Payment payment = paymentRepository.findById(paymentId).orElseThrow(
                    () -> new RuntimeException("Paiement introuvable")
            );
            payment.setStatus(status);
            Payment updatedPayment = paymentRepository.save(payment);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Statut mis à jour avec succès");
            response.put("payment", updatedPayment);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Erreur lors de la mise à jour du statut");
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }
}