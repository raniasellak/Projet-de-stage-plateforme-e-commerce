import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { TeamMemberService, TeamMemberDto, Department, EmploymentStatus, PageResponse } from '../services/team-member.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-team-member',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './team-member.html',
  styleUrl: './team-member.css'
})
export class TeamMember implements OnInit {
  // ✅ Correction : Utiliser TeamMemberDto[] au lieu de TeamMember[]
  teamMembers: TeamMemberDto[] = [];
  isLoading = true;
  errorMessage = '';

  // 🔹 Filtres
  search = '';
  selectedDepartment?: Department;
  isActive?: boolean;

  // 🔹 Pagination
  page = 0;
  size = 5; // nombre d'éléments par page
  totalPages = 0;
  totalElements = 0;

  constructor(public teamMemberService: TeamMemberService, private router: Router) {}
  goToAddMember() {
      this.router.navigate(['/admin/team-member/add']); // adapte le path selon ton routing
    }

  ngOnInit(): void {
    this.loadTeamMembers();
  }

  loadTeamMembers(): void {
    this.isLoading = true;
    this.teamMemberService.searchTeamMembers(
      this.selectedDepartment,
      this.isActive,
      this.search,
      this.page,
      this.size
    ).subscribe({
      // ✅ Correction : Utiliser TeamMemberDto au lieu de TeamMember
      next: (response: PageResponse<TeamMemberDto>) => {
        this.teamMembers = response.content;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur récupération membres:', err);
        this.errorMessage = 'Impossible de charger les membres';
        this.isLoading = false;
      }
    });
  }

  // 🔹 Gestion pagination
  nextPage(): void {
    if (this.page < this.totalPages - 1) {
      this.page++;
      this.loadTeamMembers();
    }
  }

  prevPage(): void {
    if (this.page > 0) {
      this.page--;
      this.loadTeamMembers();
    }
  }

  // 🔹 Réinitialiser les filtres
  resetFilters(): void {
    this.search = '';
    this.selectedDepartment = undefined;
    this.isActive = undefined;
    this.page = 0;
    this.loadTeamMembers();
  }
}
