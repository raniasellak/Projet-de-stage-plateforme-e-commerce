import { Component , OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Authentication } from '../services/authentication';
import { Product } from '../products/models/product.model';
import { ProductService } from '../products/services/product.service';
import { ProductResponse } from '../products/models/product.model';
import { CarCards } from '../car-cards/car-cards';
import { Boutique } from '../boutique/boutique';

@Component({
  selector: 'app-home',
    standalone: true,
    imports: [CommonModule, CarCards],
    template: `
      <div class="home-container">
        <!-- Header Section -->
        <section class="hero-section">
          <div class="hero-content">
            <h1 class="hero-title">Bienvenue chez Location Auto</h1>
            <p class="hero-subtitle">Trouvez la voiture parfaite pour vos besoins</p>
            <button class="btn btn-primary hero-btn" (click)="scrollToVoitures()">
              Voir nos voitures
            </button>
          </div>
        </section>

        <!-- Section Voitures Populaires -->
        <section class="voitures-section" #voituresSection>
          <div class="container">
            <div class="section-header">
              <h2 class="section-title">Nos Voitures Populaires</h2>
              <p class="section-description">Découvrez notre sélection des voitures les plus demandées</p>
            </div>

            <!-- Utilisation du composant CarCards -->
            <app-car-cards
              [voitures]="voituresPopulaires"
              [loading]="loadingVoitures"
              (onRentClick)="onVoitureRent($event)">
            </app-car-cards>

            <!-- Bouton pour voir toutes les voitures -->
            <div class="text-center mt-4" *ngIf="!loadingVoitures">
              <button class="btn btn-outline-primary" (click)="allerBoutique()">
                Voir toutes nos voitures
              </button>
            </div>
          </div>
        </section>

        <!-- Section Services -->
        <section class="services-section">
          <div class="container">
            <h2 class="section-title">Nos Services</h2>
            <div class="services-grid">
              <div class="service-card">
                <div class="service-icon">🚗</div>
                <h3>Location Flexible</h3>
                <p>Louez pour une heure, une journée ou plus selon vos besoins</p>
              </div>
              <div class="service-card">
                <div class="service-icon">💯</div>
                <h3>Qualité Garantie</h3>
                <p>Toutes nos voitures sont régulièrement entretenues et contrôlées</p>
              </div>
              <div class="service-card">
                <div class="service-icon">📞</div>
                <h3>Support 24/7</h3>
                <p>Notre équipe est disponible à tout moment pour vous aider</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    `,
    styles: [`
      .home-container {
        min-height: 100vh;
      }

      .hero-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 100px 0;
        text-align: center;
      }

      .hero-title {
        font-size: 3rem;
        font-weight: bold;
        margin-bottom: 1rem;
      }

      .hero-subtitle {
        font-size: 1.2rem;
        margin-bottom: 2rem;
        opacity: 0.9;
      }

      .hero-btn {
        font-size: 1.1rem;
        padding: 12px 30px;
        border-radius: 25px;
      }

      .voitures-section {
        padding: 80px 0;
        background-color: #f8f9fa;
      }

      .section-header {
        text-align: center;
        margin-bottom: 50px;
      }

      .section-title {
        font-size: 2.5rem;
        font-weight: bold;
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      .section-description {
        font-size: 1.1rem;
        color: #6c757d;
        max-width: 600px;
        margin: 0 auto;
      }

      .services-section {
        padding: 80px 0;
        background-color: white;
      }

      .services-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 30px;
        margin-top: 50px;
      }

      .service-card {
        text-align: center;
        padding: 40px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
      }

      .service-card:hover {
        transform: translateY(-5px);
      }

      .service-icon {
        font-size: 3rem;
        margin-bottom: 20px;
      }

      .service-card h3 {
        color: #2c3e50;
        margin-bottom: 15px;
      }

      .service-card p {
        color: #6c757d;
        line-height: 1.6;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }

      @media (max-width: 768px) {
        .hero-title {
          font-size: 2rem;
        }

        .section-title {
          font-size: 2rem;
        }
      }
    `]
  })
  export class Home implements OnInit {
    voituresPopulaires: Product[] = [];
    loadingVoitures: boolean = false;

    constructor(private productService: ProductService , private router: Router) {}

    ngOnInit(): void {
      this.chargerVoituresPopulaires();
    }

    chargerVoituresPopulaires(): void {
      this.loadingVoitures = true;

      // Charger les 6 premières voitures depuis l'API
      this.productService.getProducts(0, 6).subscribe({
        next: (response: ProductResponse) => {
          this.voituresPopulaires = (response.produits || []).slice(0, 6);
          this.loadingVoitures = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des voitures:', error);
          this.loadingVoitures = false;
          // En cas d'erreur, afficher les données de démonstration
          this.voituresPopulaires = [];
        }
      });
    }

    onVoitureRent(voiture: Product): void {
      // Logique de location - à adapter selon vos besoins
      console.log('Voiture sélectionnée pour location:', voiture);
      alert(`Vous avez sélectionné: ${voiture.nom} pour ${voiture.prix}€/jour`);

      // Ici vous pouvez rediriger vers une page de réservation
      // this.router.navigate(['/reservation', voiture.id]);
    }

    voirToutesVoitures(): void {
      // Redirection vers la boutique - à adapter selon votre routing
      console.log('Redirection vers la boutique');
      // this.router.navigate(['/boutique']);
    }

    scrollToVoitures(): void {
      const element = document.querySelector('.voitures-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }

  allerBoutique(): void {
      this.router.navigate(['/boutique']);
    }
  }
