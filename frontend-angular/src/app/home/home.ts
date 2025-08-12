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

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule,MatCardModule, MatDividerModule,RouterModule,
                                                             MatButtonModule,
  template: `
      <div class="container">
        <h1 class="text-center mb-4">Nos Voitures de Location</h1>
        <app-car-cards
          [voitures]="products"
          [loading]="loading"
          (onRentClick)="handleRentClick($event)">
        </app-car-cards>

        <!-- Pagination optionnelle -->
        <nav *ngIf="totalPages > 1" class="d-flex justify-content-center mt-4">
          <button
            class="btn btn-primary mx-1"
            *ngFor="let page of pages"
            [disabled]="page === currentPage"
            (click)="loadPage(page)">
            {{ page + 1 }}
          </button>
        </nav>
      </div>
    `
  })
  export class Home implements OnInit {
    products: Product[] = [];
    loading = false;
    currentPage = 0;
    pageSize = 6;
    totalPages = 0;
    totalItems = 0;
    pages: number[] = [];

    constructor(private productService: ProductService) {}

    ngOnInit() {
      this.loadProducts();
    }

    loadProducts(page: number = 0, keyword: string = '') {
      this.loading = true;
      this.currentPage = page;

      this.productService.getProducts(page, this.pageSize, keyword).subscribe({
        next: (response: ProductResponse) => {
          this.products = response.produits || [];
          this.totalItems = response.totalItems;
          this.totalPages = response.totalPages || Math.ceil(this.totalItems / this.pageSize);
          this.pages = Array.from({length: this.totalPages}, (_, i) => i);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des produits:', error);
          this.loading = false;
          // Optionnel : afficher un message d'erreur à l'utilisateur
        }
      });
    }

    loadPage(page: number) {
      this.loadProducts(page);
    }

    handleRentClick(product: Product) {
      console.log('Location demandée pour:', product.nom);
      // Ici vous ajouterez plus tard la logique de location
      // Par exemple : redirection vers une page de réservation
      // this.router.navigate(['/rent', product.id]);
    }

    // Méthode pour rechercher des produits
    searchProducts(keyword: string) {
      this.loadProducts(0, keyword);
    }
  }
