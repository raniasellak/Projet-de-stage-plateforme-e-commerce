import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Authentication } from '../../services/authentication';

@Component({
  selector: 'app-navbar-client',
  standalone: true,
  imports: [CommonModule,MatCardModule, MatDividerModule,RouterModule,
                                                                       MatButtonModule,
                                                                       MatToolbarModule],
  templateUrl: './navbar-client.html',
  styleUrl: './navbar-client.css'
})
export class NavbarClient  implements OnInit {

   menuOpen = false;

    constructor(
      public authService: Authentication,
      private router: Router
    ) { }

    ngOnInit(): void {
      // Vérifier si l'utilisateur est authentifié
      if (!this.authService.authenticated) {
        this.router.navigate(['/login']);
      }
    }

    toggleMenu(): void {
      this.menuOpen = !this.menuOpen;
    }

    logout(): void {
      this.authService.logout();
      this.router.navigate(['/login']);
    }

    // Fermer le menu mobile quand on clique sur un lien
    closeMenu(): void {
      this.menuOpen = false;
    }

  goToBoutique() {
    this.router.navigate(['/boutique']);
  }

}
