package ma.Vala.Boutique.security.service;

import lombok.AllArgsConstructor;
import ma.Vala.Boutique.security.entities.AppRole;
import ma.Vala.Boutique.security.entities.AppUser;
import ma.Vala.Boutique.security.repo.AppRoleRepository;
import ma.Vala.Boutique.security.repo.AppUserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Transactional
@AllArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AppUserRepository appUserRepository;
    private final AppRoleRepository appRoleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AppUser addNewUser(String username, String password, String email, String confirmPassword) {
        AppUser existingUser = appUserRepository.findByUsername(username);
        if (existingUser != null) {
            throw new RuntimeException("This user already exists");
        }

        if (!password.equals(confirmPassword)) {
            throw new RuntimeException("Passwords do not match");
        }

        AppUser user = AppUser.builder()
                .userId(UUID.randomUUID().toString())
                .username(username)
                .password(passwordEncoder.encode(password))
                .email(email)
                .build();

        return appUserRepository.save(user);
    }

    @Override
    public AppRole addNewRole(String role) {
        AppRole existingRole = appRoleRepository.findById(role).orElse(null);
        if (existingRole != null) {
            throw new RuntimeException("This role already exists");
        }

        AppRole appRole = AppRole.builder()
                .role(role)
                .build();

        return appRoleRepository.save(appRole);
    }

    @Override
    public void addRoleToUser(String username, String role) {
        AppUser appUser = appUserRepository.findByUsername(username);
        if (appUser == null) {
            throw new RuntimeException("User not found");
        }

        AppRole appRole = appRoleRepository.findById(role)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        appUser.getRoles().add(appRole);
        appUserRepository.save(appUser); // Important pour persister la relation
    }

    @Override
    public void removeRoleFromUser(String username, String role) {
        AppUser appUser = appUserRepository.findByUsername(username);
        if (appUser == null) {
            throw new RuntimeException("User not found");
        }

        AppRole appRole = appRoleRepository.findById(role)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        appUser.getRoles().remove(appRole);
        appUserRepository.save(appUser); // Important pour persister la suppression
    }

    @Override
    public AppUser loadUserByUsername(String username) {
        AppUser appUser = appUserRepository.findByUsername(username);
        if (appUser == null) {
            throw new RuntimeException("User not found");
        }
        return appUser;
    }
}
