package ma.Vala.Boutique.service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
public class PayPalService {

    @Value("${paypal.client.id}")
    private String clientId;

    @Value("${paypal.client.secret}")
    private String clientSecret;

    @Value("${paypal.mode:sandbox}")
    private String mode; // sandbox ou live

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public PayPalService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    // URL de base selon l'environnement
    private String getBaseUrl() {
        return "sandbox".equals(mode)
                ? "https://api-m.sandbox.paypal.com"
                : "https://api-m.paypal.com";
    }

    // 1. Obtenir un token d'accès
    public String getAccessToken() {
        try {
            String auth = Base64.getEncoder()
                    .encodeToString((clientId + ":" + clientSecret).getBytes());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            headers.set("Authorization", "Basic " + auth);

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "client_credentials");

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    getBaseUrl() + "/v1/oauth2/token",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());
            return jsonResponse.get("access_token").asText();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de l'obtention du token PayPal", e);
        }
    }

    // 2. Créer un paiement
    public Map<String, Object> createPayment(Double amount, String currency, String returnUrl, String cancelUrl, String description) {
        try {
            String accessToken = getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + accessToken);

            // Créer le payload pour PayPal
            Map<String, Object> payment = new HashMap<>();
            payment.put("intent", "CAPTURE");

            // Unité de purchase
            Map<String, Object> purchaseUnit = new HashMap<>();
            Map<String, Object> amountMap = new HashMap<>();
            amountMap.put("currency_code", currency);
            amountMap.put("value", String.format("%.2f", amount));
            purchaseUnit.put("amount", amountMap);
            purchaseUnit.put("description", description);

            payment.put("purchase_units", new Object[]{purchaseUnit});

            // URLs de redirection
            Map<String, Object> applicationContext = new HashMap<>();
            applicationContext.put("return_url", returnUrl);
            applicationContext.put("cancel_url", cancelUrl);
            payment.put("application_context", applicationContext);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payment, headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    getBaseUrl() + "/v2/checkout/orders",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());

            Map<String, Object> result = new HashMap<>();
            result.put("id", jsonResponse.get("id").asText());
            result.put("status", jsonResponse.get("status").asText());

            // Extraire l'URL d'approbation
            JsonNode links = jsonResponse.get("links");
            for (JsonNode link : links) {
                if ("approve".equals(link.get("rel").asText())) {
                    result.put("approvalUrl", link.get("href").asText());
                    break;
                }
            }

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création du paiement PayPal", e);
        }
    }

    // 3. Capturer le paiement après approbation
    public Map<String, Object> capturePayment(String orderId) {
        try {
            String accessToken = getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + accessToken);

            HttpEntity<String> entity = new HttpEntity<>("{}", headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    getBaseUrl() + "/v2/checkout/orders/" + orderId + "/capture",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());

            Map<String, Object> result = new HashMap<>();
            result.put("id", jsonResponse.get("id").asText());
            result.put("status", jsonResponse.get("status").asText());

            // Extraire les détails de la capture
            if (jsonResponse.has("purchase_units")) {
                JsonNode captureDetails = jsonResponse.get("purchase_units").get(0)
                        .get("payments").get("captures").get(0);
                result.put("captureId", captureDetails.get("id").asText());
                result.put("amount", captureDetails.get("amount").get("value").asText());
            }

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la capture du paiement PayPal", e);
        }
    }

    // 4. Vérifier le statut d'un paiement
    public Map<String, Object> getPaymentDetails(String orderId) {
        try {
            String accessToken = getAccessToken();

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                    getBaseUrl() + "/v2/checkout/orders/" + orderId,
                    HttpMethod.GET,
                    entity,
                    String.class
            );

            JsonNode jsonResponse = objectMapper.readTree(response.getBody());

            Map<String, Object> result = new HashMap<>();
            result.put("id", jsonResponse.get("id").asText());
            result.put("status", jsonResponse.get("status").asText());

            return result;

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la vérification du paiement PayPal", e);
        }
    }
}