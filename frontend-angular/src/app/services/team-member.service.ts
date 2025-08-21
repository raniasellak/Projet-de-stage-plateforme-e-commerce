import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface TeamMemberDto {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  department: Department;
  imageUrl?: string;
  isActive: boolean;
  description:string;


}

export enum Department {
  ADMINISTRATION = 'ADMINISTRATION',
  VENTES = 'VENTES',
  MAINTENANCE = 'MAINTENANCE',
  COMPTABILITE = 'COMPTABILITE',
  MARKETING = 'MARKETING',
  RH = 'RH',
  SECURITE = 'SECURITE'
}

export enum EmploymentStatus {
  CDI = 'CDI',
  CDD = 'CDD',
  STAGE = 'STAGE',
  FREELANCE = 'FREELANCE',
  TEMPS_PARTIEL = 'TEMPS_PARTIEL'
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class TeamMemberService {
  private readonly API_URL = 'http://localhost:8085/api/team-members';

  constructor(private http: HttpClient) {}

  // ============= OPÉRATIONS CRUD =============

  createTeamMember(teamMember: TeamMemberDto): Observable<TeamMemberDto> {
    return this.http.post<TeamMemberDto>(this.API_URL, teamMember);
  }

  getAllTeamMembers(): Observable<TeamMemberDto[]> {
    return this.http.get<TeamMemberDto[]>(this.API_URL);
  }

  getTeamMemberById(id: number): Observable<TeamMemberDto> {
    return this.http.get<TeamMemberDto>(`${this.API_URL}/${id}`);
  }

  updateTeamMember(id: number, teamMember: TeamMemberDto): Observable<TeamMemberDto> {
    return this.http.put<TeamMemberDto>(`${this.API_URL}/${id}`, teamMember);
  }

  deleteTeamMember(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }

  // ============= RECHERCHES SPÉCIFIQUES =============

  getActiveTeamMembers(): Observable<TeamMemberDto[]> {
    return this.http.get<TeamMemberDto[]>(`${this.API_URL}/active`);
  }

  getTeamMembersByDepartment(department: Department): Observable<TeamMemberDto[]> {
    return this.http.get<TeamMemberDto[]>(`${this.API_URL}/department/${department}`);
  }

  getTeamMemberByEmail(email: string): Observable<TeamMemberDto> {
    return this.http.get<TeamMemberDto>(`${this.API_URL}/email/${email}`);
  }

  searchTeamMembers(
    department?: Department,
    isActive?: boolean,
    search: string = '',
    page: number = 0,
    size: number = 10
  ): Observable<PageResponse<TeamMemberDto>> {
    let params = new HttpParams()
      .set('search', search)
      .set('page', page.toString())
      .set('size', size.toString());

    if (department) {
      params = params.set('department', department);
    }
    if (isActive !== undefined) {
      params = params.set('isActive', isActive.toString());
    }

    return this.http.get<PageResponse<TeamMemberDto>>(`${this.API_URL}/search`, { params });
  }

  // ============= OPÉRATIONS SPÉCIALES =============

  activateTeamMember(id: number): Observable<TeamMemberDto> {
    return this.http.patch<TeamMemberDto>(`${this.API_URL}/${id}/activate`, {});
  }

  deactivateTeamMember(id: number): Observable<TeamMemberDto> {
    return this.http.patch<TeamMemberDto>(`${this.API_URL}/${id}/deactivate`, {});
  }

  // ============= STATISTIQUES =============

  getTeamMemberStatsByDepartment(): Observable<Map<Department, number>> {
    return this.http.get<Map<Department, number>>(`${this.API_URL}/statistics/by-department`);
  }

  getTotalTeamMembersCount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/count`);
  }

  getActiveTeamMembersCount(): Observable<number> {
    return this.http.get<number>(`${this.API_URL}/count/active`);
  }

  // ============= MÉTHODES UTILITAIRES =============

  getDepartmentDisplayName(department: Department): string {
    const departmentNames = {
      [Department.ADMINISTRATION]: 'Administration',
      [Department.VENTES]: 'Ventes',
      [Department.MAINTENANCE]: 'Maintenance',
      [Department.COMPTABILITE]: 'Comptabilité',
      [Department.MARKETING]: 'Marketing',
      [Department.RH]: 'Ressources Humaines',
      [Department.SECURITE]: 'Sécurité'
    };
    return departmentNames[department] || department;
  }

  getEmploymentStatusDisplayName(status: EmploymentStatus): string {
    const statusNames = {
      [EmploymentStatus.CDI]: 'CDI',
      [EmploymentStatus.CDD]: 'CDD',
      [EmploymentStatus.STAGE]: 'Stage',
      [EmploymentStatus.FREELANCE]: 'Freelance',
      [EmploymentStatus.TEMPS_PARTIEL]: 'Temps Partiel'
    };
    return statusNames[status] || status;
  }

  getDepartmentOptions(): { value: Department; label: string }[] {
    return Object.values(Department).map(dept => ({
      value: dept,
      label: this.getDepartmentDisplayName(dept)
    }));
  }

  getEmploymentStatusOptions(): { value: EmploymentStatus; label: string }[] {
    return Object.values(EmploymentStatus).map(status => ({
      value: status,
      label: this.getEmploymentStatusDisplayName(status)
    }));
  }
}
