package ma.Vala.Boutique.service;

import ma.Vala.Boutique.entities.TeamMember;
import ma.Vala.Boutique.repository.TeamMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class TeamMemberService {
    private final TeamMemberRepository teamMemberRepository;

    // ============= OPÉRATIONS CRUD =============

    public TeamMember createTeamMember(TeamMember teamMember) {
        // Vérifier si l'email existe déjà
        if (teamMemberRepository.existsByEmail(teamMember.getEmail())) {
            throw new IllegalArgumentException("Un membre avec cet email existe déjà");
        }

        // Définir la date d'embauche si pas spécifiée
        if (teamMember.getHireDate() == null) {
            teamMember.setHireDate(LocalDateTime.now());
        }

        return teamMemberRepository.save(teamMember);
    }

    @Transactional(readOnly = true)
    public List<TeamMember> getAllTeamMembers() {
        return teamMemberRepository.findAll();
    }

    @Transactional(readOnly = true)
    public TeamMember getTeamMemberById(Long id) {
        return teamMemberRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Membre d'équipe non trouvé avec l'ID : " + id));
    }

    public TeamMember updateTeamMember(Long id, TeamMember teamMember) {
        TeamMember existingMember = getTeamMemberById(id);

        // Vérifier si le nouvel email n'est pas déjà utilisé par un autre membre
        if (!existingMember.getEmail().equals(teamMember.getEmail()) &&
                teamMemberRepository.existsByEmail(teamMember.getEmail())) {
            throw new IllegalArgumentException("Un membre avec cet email existe déjà");
        }

        // Mettre à jour les champs
        existingMember.setFirstName(teamMember.getFirstName());
        existingMember.setLastName(teamMember.getLastName());
        existingMember.setEmail(teamMember.getEmail());
        existingMember.setPhoneNumber(teamMember.getPhoneNumber());
        existingMember.setPosition(teamMember.getPosition());
        existingMember.setDepartment(teamMember.getDepartment());
        existingMember.setEmploymentStatus(teamMember.getEmploymentStatus());
        existingMember.setSalary(teamMember.getSalary());
        existingMember.setAddress(teamMember.getAddress());
        existingMember.setCity(teamMember.getCity());
        existingMember.setPostalCode(teamMember.getPostalCode());
        existingMember.setIsActive(teamMember.getIsActive());

        return teamMemberRepository.save(existingMember);
    }

    public void deleteTeamMember(Long id) {
        if (!teamMemberRepository.existsById(id)) {
            throw new RuntimeException("Membre d'équipe non trouvé avec l'ID : " + id);
        }
        teamMemberRepository.deleteById(id);
    }

    // ============= RECHERCHES SPÉCIFIQUES =============

    @Transactional(readOnly = true)
    public List<TeamMember> getActiveTeamMembers() {
        return teamMemberRepository.findByIsActiveTrue();
    }

    @Transactional(readOnly = true)
    public List<TeamMember> getTeamMembersByDepartment(TeamMember.Department department) {
        return teamMemberRepository.findByDepartmentAndIsActiveTrue(department);
    }

    @Transactional(readOnly = true)
    public TeamMember getTeamMemberByEmail(String email) {
        return teamMemberRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Membre d'équipe non trouvé avec l'email : " + email));
    }

    @Transactional(readOnly = true)
    public Page<TeamMember> searchTeamMembers(TeamMember.Department department, Boolean isActive, String search, Pageable pageable) {
        return teamMemberRepository.findTeamMembersWithFilters(department, isActive, search, pageable);
    }

    // ============= OPÉRATIONS SPÉCIALES =============

    public TeamMember activateTeamMember(Long id) {
        TeamMember teamMember = getTeamMemberById(id);
        teamMember.setIsActive(true);
        return teamMemberRepository.save(teamMember);
    }

    public TeamMember deactivateTeamMember(Long id) {
        TeamMember teamMember = getTeamMemberById(id);
        teamMember.setIsActive(false);
        return teamMemberRepository.save(teamMember);
    }

    // ============= STATISTIQUES =============

    @Transactional(readOnly = true)
    public Map<TeamMember.Department, Long> getTeamMemberStatsByDepartment() {
        List<Object[]> results = teamMemberRepository.countActiveTeamMembersByDepartment();
        Map<TeamMember.Department, Long> stats = new HashMap<>();

        for (Object[] result : results) {
            TeamMember.Department department = (TeamMember.Department) result[0];
            Long count = (Long) result[1];
            stats.put(department, count);
        }

        return stats;
    }

    @Transactional(readOnly = true)
    public Long getTotalTeamMembersCount() {
        return teamMemberRepository.count();
    }

    @Transactional(readOnly = true)
    public Long getActiveTeamMembersCount() {
        return (long) teamMemberRepository.findByIsActiveTrue().size();
    }
}