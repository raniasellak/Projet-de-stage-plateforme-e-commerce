import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { environment } from '../../environments/environment';

// Imports avec votre convention
import { Product, ProductResponse } from './models/product.model';
import { ProductService } from './services/product.service';
import { AddProduct } from '../add-product/add-product';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule , AddProduct
  ],
  templateUrl: './products.html',
  styleUrls: ['./products.css']
})
export class Products implements OnInit, AfterViewInit {
  public dataSource = new MatTableDataSource<Product>([]);
  public displayedColumns: string[] = [
    "id", "nom", "prix", "description", "couleur",
    "annee", "quantite", "categorie", "marque", "imageUrl", "actions"
  ];

  public totalItems = 0;
  public pageSize = 10;
  public currentPage = 0;
  public keyword = '';
  public isLoading = false;
  public showAddForm = false;


  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private productService: ProductService, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadProducts();
  }



  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    // Configuration du paginator
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Éléments par page:';
      this.paginator._intl.nextPageLabel = 'Page suivante';
      this.paginator._intl.previousPageLabel = 'Page précédente';
      this.paginator._intl.firstPageLabel = 'Première page';
      this.paginator._intl.lastPageLabel = 'Dernière page';
    }
  }

  navigateToAddProduct(): void {
    this.router.navigate(['/admin/products/add']);
  }

  loadProducts() {
    console.log('Chargement des produits...', {
      page: this.currentPage,
      size: this.pageSize,
      keyword: this.keyword
    });

    this.isLoading = true;

    this.productService.getProducts(this.currentPage, this.pageSize, this.keyword)
      .subscribe({
        next: (response: ProductResponse) => {
          console.log('Données reçues:', response);
          this.dataSource.data = response.produits || [];
          this.totalItems = response.totalItems || 0;
          this.isLoading = false;

          // Vérifier si la réponse est valide
          if (!response.produits) {
            console.warn('Aucun produit dans la réponse');
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement des produits:', error);
          this.isLoading = false;

          // Afficher des données de test en cas d'erreur de connexion
          if (error.status === 0 || error.status === 404) {
            console.log('Chargement des données de test...');
            this.loadMockData();
          }
        }
      });
  }

  loadMockData() {
    const mockProducts: Product[] = [];
    for (let i = 1; i <= 15; i++) {
      mockProducts.push({
        id: i,
        nom: `Produit ${i}`,
        prix: Math.floor(Math.random() * 100000) + 10000,
        description: `Description détaillée du produit ${i}. Ce produit offre une excellente qualité et performance.`,
        // CORRECTION: Remplacer null par undefined
        couleur: i % 3 === 0 ? undefined : ['Rouge', 'Bleu', 'Vert', 'Noir', 'Blanc'][i % 5],
        annee: i % 4 === 0 ? undefined : 2020 + (i % 5),
        quantite: Math.floor(Math.random() * 50) + 1,
        categorie: ['Voiture', 'Moto', 'Accessoire', 'Pièce'][i % 4],
        marque: `Marque ${String.fromCharCode(65 + (i % 5))}`,
        imageUrl: i % 3 === 0 ? undefined : `http://localhost:8085/images/produit${i}.webp`
      });
    }
    this.dataSource.data = mockProducts.slice(
      this.currentPage * this.pageSize,
      (this.currentPage + 1) * this.pageSize
    );
    this.totalItems = mockProducts.length;
  }

  filterProducts(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.keyword = value.trim();
    this.currentPage = 0; // Retour à la première page
    this.loadProducts();
  }

  onPageChange(event: PageEvent) {
    console.log('Changement de page:', event);
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  // Méthodes pour les actions
  editProduct(product: Product): void {
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  viewProduct(product: Product) {
    console.log('Voir produit:', product);
    this.router.navigate(['/admin/products/view', product.id]);
  }

  deleteProduct(product: Product): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${product.nom}" ?`)) {
      console.log('Supprimer produit:', product);

      // CORRECTION: Vérifier que product.id n'est pas undefined
      if (product.id !== undefined) {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            console.log('Produit supprimé avec succès');
            this.snackBar.open('Produit supprimé avec succès', 'Fermer', {
              duration: 3000
            });
            this.loadProducts();
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.snackBar.open('Erreur lors de la suppression', 'Fermer', {
              duration: 3000
            });
          }
        });
      } else {
        console.error('Impossible de supprimer le produit: ID non défini');
        this.snackBar.open('Erreur: ID du produit non défini', 'Fermer', {
          duration: 3000
        });
      }
    }
  }
onProductAdded(): void {
  this.showAddForm = false; // Ferme le formulaire après ajout
  this.refresh();           // Recharge la liste des produits
}


  // Méthode utilitaire pour obtenir la couleur CSS
  getColorValue(couleur: string): string {
    const colorMap: { [key: string]: string } = {
      'Rouge': '#f44336',
      'Bleu': '#2196f3',
      'Vert': '#4caf50',
      'Noir': '#424242',
      'Blanc': '#fafafa',
      'Jaune': '#ffeb3b',
      'Orange': '#ff9800',
      'Violet': '#9c27b0',
      'Rose': '#e91e63',
      'Gris': '#9e9e9e'
    };

    return colorMap[couleur] || '#607d8b';
  }

  // Méthode pour rafraîchir les données
  refresh() {
    this.keyword = '';
    this.currentPage = 0;
    this.loadProducts();
  }

  getImageUrl(fileName: string): string {
    return `${environment.imagePath}/${fileName}`;
  }
}
