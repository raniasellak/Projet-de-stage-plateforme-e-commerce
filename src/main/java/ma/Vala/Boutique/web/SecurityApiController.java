package ma.Vala.Boutique.web;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController  // ← API seulement
@RequestMapping("/api/auth")  // ← Endpoints d'authentification
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:49902"})  // ← Autorise Angular
public class SecurityApiController {

    // 👤 RÉCUPÉRER LES INFOS DE L'UTILISATEUR CONNECTÉ
    @GetMapping("/user")
    public ResponseEntity<Map<String, Object>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Map<String, Object> response = new HashMap<>();

        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {

            // Utilisateur connecté
            response.put("authenticated", true);
            response.put("username", authentication.getName());
            response.put("authorities", authentication.getAuthorities());

        } else {
            // Utilisateur non connecté
            response.put("authenticated", false);
            response.put("username", null);
            response.put("authorities", null);
        }

        return ResponseEntity.ok(response);
    }

    // 🚫 ENDPOINT POUR LES ERREURS D'AUTORISATION
    @GetMapping("/not-authorized")
    public ResponseEntity<Map<String, Object>> notAuthorized() {
        Map<String, Object> response = new HashMap<>();
        response.put("error", true);
        response.put("message", "Accès non autorisé");
        response.put("code", "NOT_AUTHORIZED");

        return ResponseEntity.status(403).body(response);  // 403 = Forbidden
    }

    // 🔐 ENDPOINT POUR VÉRIFIER SI L'UTILISATEUR DOIT SE CONNECTER
    @GetMapping("/login-required")
    public ResponseEntity<Map<String, Object>> loginRequired() {
        Map<String, Object> response = new HashMap<>();
        response.put("error", true);
        response.put("message", "Connexion requise");
        response.put("code", "LOGIN_REQUIRED");

        return ResponseEntity.status(401).body(response);  // 401 = Unauthorized
    }

    // ✅ ENDPOINT POUR VÉRIFIER LE STATUT D'AUTHENTIFICATION
    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        Map<String, Object> response = new HashMap<>();

        if (authentication != null && authentication.isAuthenticated()
                && !authentication.getName().equals("anonymousUser")) {

            response.put("authenticated", true);
            response.put("username", authentication.getName());

            // Vérifier les rôles
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_ADMIN"));
            boolean isUser = authentication.getAuthorities().stream()
                    .anyMatch(authority -> authority.getAuthority().equals("ROLE_USER"));

            response.put("isAdmin", isAdmin);
            response.put("isUser", isUser);
            response.put("roles", authentication.getAuthorities());

        } else {
            response.put("authenticated", false);
            response.put("username", null);
            response.put("isAdmin", false);
            response.put("isUser", false);
            response.put("roles", null);
        }

        return ResponseEntity.ok(response);
    }

    // 🏠 ENDPOINT POUR REDIRIGER VERS LA PAGE D'ACCUEIL
    @GetMapping("/home")
    public ResponseEntity<Map<String, Object>> getHomeInfo() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Bienvenue sur l'API de la boutique");
        response.put("redirectTo", "/user/index");  // Angular utilisera cette info

        return ResponseEntity.ok(response);
    }
}