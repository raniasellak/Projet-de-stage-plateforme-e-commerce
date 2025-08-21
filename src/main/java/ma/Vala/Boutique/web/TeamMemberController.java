package ma.Vala.Boutique.web;

import ma.Vala.Boutique.entities.TeamMember;
import ma.Vala.Boutique.service.TeamMemberService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/team-members")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")

public class TeamMemberController {
    private final TeamMemberService teamMemberService;

    // ============= OPÉRATIONS CRUD =============

    @PostMapping
    public ResponseEntity<TeamMember> createTeamMember(@Valid @RequestBody TeamMember teamMember) {
        try {
            TeamMember createdTeamMember = teamMemberService.createTeamMember(teamMember);
            return new ResponseEntity<>(createdTeamMember, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping
    public ResponseEntity<List<TeamMember>> getAllTeamMembers() {
        List<TeamMember> teamMembers = teamMemberService.getAllTeamMembers();
        return new ResponseEntity<>(teamMembers, HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeamMember> getTeamMemberById(@PathVariable Long id) {
        try {
            TeamMember teamMember = teamMemberService.getTeamMemberById(id);
            return new ResponseEntity<>(teamMember, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<TeamMember> updateTeamMember(
            @PathVariable Long id,
            @Valid @RequestBody TeamMember teamMember) {
        try {
            TeamMember updatedTeamMember = teamMemberService.updateTeamMember(id, teamMember);
            return new ResponseEntity<>(updatedTeamMember, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTeamMember(@PathVariable Long id) {
        try {
            teamMemberService.deleteTeamMember(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // ============= RECHERCHES SPÉCIFIQUES =============

    @GetMapping("/active")
    public ResponseEntity<List<TeamMember>> getActiveTeamMembers() {
        List<TeamMember> activeMembers = teamMemberService.getActiveTeamMembers();
        return new ResponseEntity<>(activeMembers, HttpStatus.OK);
    }

    @GetMapping("/department/{department}")
    public ResponseEntity<List<TeamMember>> getTeamMembersByDepartment(
            @PathVariable TeamMember.Department department) {
        List<TeamMember> members = teamMemberService.getTeamMembersByDepartment(department);
        return new ResponseEntity<>(members, HttpStatus.OK);
    }

    @GetMapping("/search")
    public ResponseEntity<Page<TeamMember>> searchTeamMembers(
            @RequestParam(required = false) TeamMember.Department department,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false, defaultValue = "") String search,
            Pageable pageable) {
        Page<TeamMember> members = teamMemberService.searchTeamMembers(department, isActive, search, pageable);
        return new ResponseEntity<>(members, HttpStatus.OK);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<TeamMember> getTeamMemberByEmail(@PathVariable String email) {
        try {
            TeamMember teamMember = teamMemberService.getTeamMemberByEmail(email);
            return new ResponseEntity<>(teamMember, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // ============= OPÉRATIONS SPÉCIALES =============

    @PatchMapping("/{id}/activate")
    public ResponseEntity<TeamMember> activateTeamMember(@PathVariable Long id) {
        try {
            TeamMember activatedMember = teamMemberService.activateTeamMember(id);
            return new ResponseEntity<>(activatedMember, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<TeamMember> deactivateTeamMember(@PathVariable Long id) {
        try {
            TeamMember deactivatedMember = teamMemberService.deactivateTeamMember(id);
            return new ResponseEntity<>(deactivatedMember, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        }
    }

    // ============= STATISTIQUES =============

    @GetMapping("/statistics/by-department")
    public ResponseEntity<Map<TeamMember.Department, Long>> getTeamMemberStatsByDepartment() {
        Map<TeamMember.Department, Long> stats = teamMemberService.getTeamMemberStatsByDepartment();
        return new ResponseEntity<>(stats, HttpStatus.OK);
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getTotalTeamMembersCount() {
        Long count = teamMemberService.getTotalTeamMembersCount();
        return new ResponseEntity<>(count, HttpStatus.OK);
    }

    @GetMapping("/count/active")
    public ResponseEntity<Long> getActiveTeamMembersCount() {
        Long count = teamMemberService.getActiveTeamMembersCount();
        return new ResponseEntity<>(count, HttpStatus.OK);
    }
}