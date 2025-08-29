// admin-template.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule, MatSidenav } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';

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
    MatListModule,
    MatBadgeModule
  ],
  templateUrl: './admin-template.html',
  styleUrls: ['./admin-template.css']
})
export class AdminTemplate implements OnInit {

  @ViewChild('drawer') drawer!: MatSidenav;

  currentPage = '';

  // Mapping des routes vers les titres de pages
  private pageTitles: { [key: string]: string } = {
    '/admin/dashboard': 'Tableau de bord',
    '/admin/reservations': 'Gestion des réservations',
    '/admin/products': 'Gestion des véhicules',
    '/admin/clients': 'Gestion des clients',
    '/admin/payments': 'Gestion des paiements',
    '/admin/team-member': 'Gestion de l\'équipe',
    '/admin/profile': 'Mon profil'
  };

  constructor(
    public authService: Authentication,
    private router: Router
  ) {
    // Écouter les changements de route pour mettre à jour le titre
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentPage = event.urlAfterRedirects;
      });
  }

  ngOnInit(): void {
    this.currentPage = this.router.url;
  }

  getPageTitle(): string {
    return this.pageTitles[this.currentPage] || 'Mon Agence';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Méthode pour fermer le menu sur mobile après navigation
  onNavigate(): void {
    if (window.innerWidth <= 768) {
      this.drawer.close();
    }
  }
}
