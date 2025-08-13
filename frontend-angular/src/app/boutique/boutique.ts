import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarCards} from '../car-cards/car-cards';
import { ProductService } from '../products/services/product.service';
import { Product, ProductResponse } from '../products/models/product.model';

@Component({
  selector: 'app-boutique',
   standalone: true,
    imports: [CommonModule, FormsModule, CarCards],
    template: `
      <div class="boutique-container">
        <!-- Header -->
        <div class="boutique-header">
          <div class="container">
            <h1 class="page-title">Notre Flotte de Véhicules</h1>
            <p class="page-description">Découvrez toutes nos voitures disponibles à la location</p>
          </div>
        </div>

        <!-- Filtres et Recherche -->
        <div class="filters-section">
          <div class="container">
            <div class="filters-container">
              <!-- Barre de recherche -->
              <div class="search-container">
                <div class="input-group">
                  <input
                    type="text"
                    class="form-control search-input"
                    placeholder="Rechercher une voiture..."
                    [(ngModel)]="searchKeyword"
                    (keyup.enter)="rechercherVoitures()"
                  />
                  <button class="btn btn-primary" type="button" (click)="rechercherVoitures()">
                    🔍 Rechercher
                  </button>
                </div>
              </div>

              <!-- Filtres -->
              <div class="filters-row">
                <div class="filter-group">
                  <label>Catégorie:</label>
                  <select class="form-select" [(ngModel)]="filtreCategorie" (change)="appliquerFiltres()">
                    <option value="">Toutes les catégories</option>
                    <option value="Berline">Berline</option>
                    <option value="SUV">SUV</option>
                    <option value="Électrique">Électrique</option>
                    <option value="Sport">Sport</option>
                  </select>
                </div>

                <div class="filter-group">
                  <label>Prix max par jour:</label>
                  <select class="form-select" [(ngModel)]="filtrePrixMax" (change)="appliquerFiltres()">
                    <option value="">Tous les prix</option>
                    <option value="50">Jusqu'à 50€</option>
                    <option value="100">Jusqu'à 100€</option>
                    <option value="150">Jusqu'à 150€</option>
                  </select>
                </div>

                <div class="filter-group">
                  <label>Marque:</label>
                  <select class="form-select" [(ngModel)]="filtreMarque" (change)="appliquerFiltres()">
                    <option value="">Toutes les marques</option>
                    <option value="BMW">BMW</option>
                    <option value="Mercedes">Mercedes</option>
                    <option value="Audi">Audi</option>
                    <option value="Tesla">Tesla</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Range Rover">Range Rover</option>
                  </select>
                </div>

                <button class="btn btn-outline-secondary" (click)="reinitialiserFiltres()">
                  Réinitialiser
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Résultats -->
        <div class="results-section">
          <div class="container">
            <!-- Informations sur les résultats -->
            <div class="results-info" *ngIf="!loadingVoitures">
              <p class="results-count">
                <strong>{{totalElements}}</strong> voiture(s) trouvée(s)
                <span *ngIf="searchKeyword || filtreCategorie || filtrePrixMax || filtreMarque">
                  selon vos critères
                </span>
              </p>
            </div>

            <!-- Composant CarCards -->
            <app-car-cards
              [voitures]="voitures"
              [loading]="loadingVoitures"
              (onRentClick)="onVoitureRent($event)">
            </app-car-cards>

            <!-- Pagination -->
            <div class="pagination-container" *ngIf="!loadingVoitures && totalPages > 1">
              <nav>
                <ul class="pagination justify-content-center">
                  <li class="page-item" [class.disabled]="currentPage === 0">
                    <button class="page-link" (click)="changerPage(currentPage - 1)" [disabled]="currentPage === 0">
                      Précédent
                    </button>
                  </li>

                  <li
                    class="page-item"
                    [class.active]="i === currentPage"
                    *ngFor="let i of getPagesArray()"
                  >
                    <button class="page-link" (click)="changerPage(i)">
                      {{ i + 1 }}
                    </button>
                  </li>

                  <li class="page-item" [class.disabled]="currentPage === totalPages - 1">
                    <button class="page-link" (click)="changerPage(currentPage + 1)" [disabled]="currentPage === totalPages - 1">
                      Suivant
                    </button>
                  </li>
                </ul>
              </nav>
            </div>
          </div>
        </div>
      </div>
    `,
    styles: [`
      .boutique-container {
        min-height: 100vh;
        background-color: #f8f9fa;
      }

      .boutique-header {
        background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
        color: white;
        padding: 60px 0;
        text-align: center;
      }

      .page-title {
        font-size: 2.5rem;
        font-weight: bold;
        margin-bottom: 1rem;
      }

      .page-description {
        font-size: 1.1rem;
        opacity: 0.9;
      }

      .filters-section {
        background-color: white;
        padding: 30px 0;
        border-bottom: 1px solid #dee2e6;
      }

      .filters-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .search-container {
        margin-bottom: 20px;
      }

      .search-input {
        font-size: 1rem;
        padding: 12px 15px;
      }

      .filters-row {
        display: flex;
        gap: 20px;
        align-items: end;
        flex-wrap: wrap;
      }

      .filter-group {
        display: flex;
        flex-direction: column;
        min-width: 150px;
      }

      .filter-group label {
        font-weight: 500;
        margin-bottom: 5px;
        color: #495057;
      }

      .form-select {
        padding: 8px 12px;
        border: 1px solid #ced4da;
        border-radius: 5px;
      }

      .results-section {
        padding: 40px 0;
      }

      .results-info {
        margin-bottom: 30px;
        padding: 15px;
        background-color: white;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }

      .results-count {
        margin: 0;
        color: #495057;
      }

      .pagination-container {
        margin-top: 40px;
      }

      .pagination .page-link {
        color: #2c3e50;
        border: 1px solid #dee2e6;
      }

      .pagination .page-item.active .page-link {
        background-color: #2c3e50;
        border-color: #2c3e50;
      }

      .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
      }

      .input-group {
        display: flex;
      }

      .input-group .form-control {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }

      .input-group .btn {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      @media (max-width: 768px) {
        .filters-row {
          flex-direction: column;
          align-items: stretch;
        }

        .filter-group {
          min-width: unset;
        }

        .page-title {
          font-size: 2rem;
        }
      }
    `]
  })
  export class Boutique implements OnInit {
    voitures: Product[] = [];
    loadingVoitures: boolean = false;

    // Paramètres de recherche et filtrage
    searchKeyword: string = '';
    filtreCategorie: string = '';
    filtrePrixMax: string = '';
    filtreMarque: string = '';

    // Paramètres de pagination
    currentPage: number = 0;
    pageSize: number = 9;
    totalElements: number = 0;
    totalPages: number = 0;

    constructor(private productService: ProductService) {}

    ngOnInit(): void {
      this.chargerVoitures();
    }

    chargerVoitures(): void {
      this.loadingVoitures = true;

      this.productService.getProducts(this.currentPage, this.pageSize, this.searchKeyword).subscribe({
        next: (response: ProductResponse) => {
          const voituresRecues = response.produits || [];
          this.voitures = this.appliquerFiltresLocaux(voituresRecues);
          this.totalElements = response.totalItems || 0;
          this.totalPages = response.totalPages || Math.ceil(this.totalElements / this.pageSize);
          this.loadingVoitures = false;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement des voitures:', error);
          this.loadingVoitures = false;
          this.voitures = [];
          this.totalElements = 0;
          this.totalPages = 0;
        }
      });
    }

    rechercherVoitures(): void {
      this.currentPage = 0;
      this.chargerVoitures();
    }

    appliquerFiltres(): void {
      this.currentPage = 0;
      this.chargerVoitures();
    }

    appliquerFiltresLocaux(voitures: Product[]): Product[] {
      return voitures.filter(voiture => {
        // Filtre par catégorie
        if (this.filtreCategorie && voiture.categorie !== this.filtreCategorie) {
          return false;
        }

        // Filtre par prix maximum
        if (this.filtrePrixMax && voiture.prix && voiture.prix > parseFloat(this.filtrePrixMax)) {
          return false;
        }

        // Filtre par marque
        if (this.filtreMarque && voiture.marque !== this.filtreMarque) {
          return false;
        }

        return true;
      });
    }

    reinitialiserFiltres(): void {
      this.searchKeyword = '';
      this.filtreCategorie = '';
      this.filtrePrixMax = '';
      this.filtreMarque = '';
      this.currentPage = 0;
      this.chargerVoitures();
    }

    changerPage(page: number): void {
      if (page >= 0 && page < this.totalPages) {
        this.currentPage = page;
        this.chargerVoitures();
      }
    }

    getPagesArray(): number[] {
      const pages = [];
      for (let i = 0; i < this.totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    onVoitureRent(voiture: Product): void {
      console.log('Voiture sélectionnée pour location:', voiture);
      alert(`Vous avez sélectionné: ${voiture.nom} pour ${voiture.prix}€/jour`);

      // Ici vous pouvez rediriger vers une page de réservation
      // this.router.navigate(['/reservation', voiture.id]);
    }
  }
