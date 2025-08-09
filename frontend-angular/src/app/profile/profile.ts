import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule,MatCardModule, MatDividerModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {

}
