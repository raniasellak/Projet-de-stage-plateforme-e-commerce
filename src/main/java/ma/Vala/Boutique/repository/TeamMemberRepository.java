package ma.Vala.Boutique.repository;

import ma.Vala.Boutique.entities.TeamMember;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository

public interface TeamMemberRepository extends JpaRepository<TeamMember, Long> {
    // Recherche par email
    Optional<TeamMember> findByEmail(String email);

    // Vérifier si un email existe déjà
    boolean existsByEmail(String email);

    // Recherche par statut actif
    List<TeamMember> findByIsActiveTrue();

    // Recherche par département
    List<TeamMember> findByDepartment(TeamMember.Department department);

    // Recherche par département et statut actif
    List<TeamMember> findByDepartmentAndIsActiveTrue(TeamMember.Department department);

    // Recherche par statut d'emploi
    List<TeamMember> findByEmploymentStatus(TeamMember.EmploymentStatus employmentStatus);

    // Recherche par nom ou prénom (insensible à la casse)
    @Query("SELECT tm FROM TeamMember tm WHERE " +
            "LOWER(tm.firstName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(tm.lastName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<TeamMember> findByNameContaining(@Param("keyword") String keyword);

    // Recherche avancée avec pagination
    @Query("SELECT tm FROM TeamMember tm WHERE " +
            "(:department IS NULL OR tm.department = :department) AND " +
            "(:isActive IS NULL OR tm.isActive = :isActive) AND " +
            "(LOWER(tm.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(tm.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(tm.email) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<TeamMember> findTeamMembersWithFilters(
            @Param("department") TeamMember.Department department,
            @Param("isActive") Boolean isActive,
            @Param("search") String search,
            Pageable pageable
    );

    // Compter les membres actifs par département
    @Query("SELECT tm.department, COUNT(tm) FROM TeamMember tm " +
            "WHERE tm.isActive = true GROUP BY tm.department")
    List<Object[]> countActiveTeamMembersByDepartment();

    // Trouver les membres embauchés dans une période
    List<TeamMember> findByHireDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
