import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
// Ajoute ces imports Material
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';

import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { Authentication } from '../services/authentication';

@Component({
  selector: 'app-admin-template',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatSidenavModule,
    MatListModule
  ],
  templateUrl: './admin-template.html',
  styleUrls: ['./admin-template.css']
})
export class AdminTemplate implements OnInit {

  @ViewChild('drawer') drawer!: MatSidenav;

  constructor(public authService: Authentication) {
  }

  ngOnInit(): void {
  }

  logout(): void {
    this.authService.logout();
  }
}
