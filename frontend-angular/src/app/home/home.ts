import { Component , OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Authentication } from '../services/authentication';
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,MatCardModule, MatDividerModule,RouterModule,
                                                             MatButtonModule,
                                                             MatToolbarModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home  {

}
