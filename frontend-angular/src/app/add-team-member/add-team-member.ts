import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamMemberService, TeamMemberDto, Department, EmploymentStatus } from '../services/team-member.service';
@Component({
  selector: 'app-add-team-member',
   standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-team-member.html',
  styleUrls: ['./add-team-member.css']
})
export class AddTeamMember {
 newMember: any = {
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    position: '',
    department: Department.ADMINISTRATION,
    employmentStatus: EmploymentStatus.CDI,
    isActive: true
  };

  constructor(public teamMemberService: TeamMemberService, public router: Router) {}

  saveMember() {
    this.teamMemberService.createTeamMember(this.newMember).subscribe({
      next: () => this.router.navigate(['/admin/team-member']),
      error: (err) => console.error(err)
    });
  }
}
