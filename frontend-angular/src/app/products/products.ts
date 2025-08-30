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
    MatSnackBarModule,
    AddProduct
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

  constructor(
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadProducts();
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    // Configuration du paginator en français
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Éléments par page:';
      this.paginator._intl.nextPageLabel = 'Page suivante';
      this.paginator._intl.previousPageLabel = 'Page précédente';
      this.paginator._intl.firstPageLabel = 'Première page';
      this.paginator._intl.lastPageLabel = 'Dernière page';
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        if (length === 0 || pageSize === 0) {
          return `0 sur ${length}`;
        }
        const startIndex = page * pageSize;
        const endIndex = startIndex < length
          ? Math.min(startIndex + pageSize, length)
          : startIndex + pageSize;
        return `${startIndex + 1} – ${endIndex} sur ${length}`;
      };
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

          // Afficher un message de succès si des produits sont chargés
          if (response.produits && response.produits.length > 0) {
            this.showSuccessMessage(`${response.produits.length} produit(s) chargé(s) avec succès`);
          }

          // Vérifier si la réponse est valide
          if (!response.produits) {
            console.warn('Aucun produit dans la réponse');
          }
        },
        error: (error) => {
          console.error('Erreur lors du chargement des produits:', error);
          this.isLoading = false;
          this.showErrorMessage('Erreur de connexion au serveur');
        }
      });
  }

  filterProducts(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.keyword = value.trim();
    this.currentPage = 0; // Retour à la première page

    // Délai pour éviter trop d'appels API
    setTimeout(() => {
      this.loadProducts();
    }, 300);
  }

  onPageChange(event: PageEvent) {
    console.log('Changement de page:', event);
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadProducts();
  }

  // Méthodes pour les actions
  editProduct(product: Product): void {
    console.log('Modifier produit:', product);
    this.router.navigate(['/admin/products/edit', product.id]);
  }

  viewProduct(product: Product): void {
    console.log('Voir produit:', product);
    this.router.navigate(['/admin/products/view', product.id]);
  }

  deleteProduct(product: Product): void {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer le produit "${product.nom}" ?\n\n⚠️ Cette action est irréversible.\n\nNote: L'image restera stockée sur Cloudinary.`;

    if (confirm(confirmMessage)) {
      console.log('Supprimer produit:', product);

      if (product.id !== undefined) {
        this.isLoading = true;

        this.productService.deleteProduct(product.id).subscribe({
          next: (response) => {
            console.log('Réponse suppression:', response);
            this.showSuccessMessage(
              response.message || `Produit "${product.nom}" supprimé avec succès`
            );
            this.loadProducts(); // Recharger la liste
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
            this.showErrorMessage(
              error.error?.message || 'Erreur lors de la suppression du produit'
            );
            this.isLoading = false;
          }
        });
      } else {
        console.error('Impossible de supprimer le produit: ID non défini');
        this.showErrorMessage('Erreur: ID du produit non défini');
      }
    }
  }

  onProductAdded(): void {
    this.showAddForm = false; // Ferme le formulaire après ajout
    this.showSuccessMessage('Produit ajouté avec succès !');
    this.refresh(); // Recharge la liste des produits
  }

  // Méthodes utilitaires
  trackByProductId(index: number, product: Product): number {
    return product.id || index;
  }

  getColorValue(couleur: string): string {
    const colorMap: { [key: string]: string } = {
      'Rouge': '#e74c3c',
      'Bleu': '#3498db',
      'Vert': '#2ecc71',
      'Noir': '#2c3e50',
      'Blanc': '#ecf0f1',
      'Jaune': '#f1c40f',
      'Orange': '#e67e22',
      'Violet': '#9b59b6',
      'Rose': '#e91e63',
      'Gris': '#95a5a6',
      'Marron': '#8b4513',
      'Argent': '#bdc3c7',
      'Or': '#f4d03f'
    };

    return colorMap[couleur] || '#607d8b';
  }

  getImageUrl(imageUrl: string): string {
    // Si pas d'URL, retourner une image par défaut
    if (!imageUrl) {
      return '';
    }

    // Si l'URL est déjà complète (Cloudinary), la retourner telle quelle
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Sinon, construire l'URL avec le chemin local (fallback)
    return `${environment.imagePath}/${imageUrl}`;
  }

  // Méthode pour rafraîchir les données
  refresh(): void {
    this.keyword = '';
    this.currentPage = 0;
    this.loadProducts();
  }

  // Méthodes pour afficher les messages
  private showSuccessMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 4000,
      panelClass: ['success-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Fermer', {
      duration: 6000,
      panelClass: ['error-snackbar'],
      horizontalPosition: 'right',
      verticalPosition: 'top'
    });
  }

  // Méthode pour tester la connexion API
  testConnection(): void {
    this.productService.testConnection().subscribe({
      next: (response) => {
        console.log('Test connexion réussi:', response);
        this.showSuccessMessage('Connexion API réussie! 🎉');
      },
      error: (error) => {
        console.error('Test connexion échoué:', error);
        this.showErrorMessage('Erreur de connexion API ❌');
      }
    });
  }

  // Méthode pour obtenir des statistiques sur les produits
  getProductStats(): { total: number, lowStock: number, categories: number } {
    const products = this.dataSource.data;
    const total = products.length;
    // Utiliser 0 comme valeur par défaut si quantite est undefined
    const lowStock = products.filter(p => (p.quantite ?? 0) < 5).length;
    const categories = new Set(products.map(p => p.categorie).filter(c => c !== undefined)).size;

    return { total, lowStock, categories };
  }

  // Méthode pour exporter les données (optionnel)
  exportProducts(): void {
    const csvData = this.convertToCSV(this.dataSource.data);
    this.downloadCSV(csvData, 'produits_export.csv');
    this.showSuccessMessage('Export CSV généré avec succès !');
  }

  private convertToCSV(products: Product[]): string {
    const headers = ['ID', 'Nom', 'Prix', 'Description', 'Couleur', 'Année', 'Quantité', 'Catégorie', 'Marque'];
    const csvContent = [
      headers.join(','),
      ...products.map(p => [
        p.id,
        `"${p.nom}"`,
        p.prix,
        `"${p.description || ''}"`,
        p.couleur || '',
        p.annee || '',
        p.quantite,
        p.categorie,
        p.marque || ''
      ].join(','))
    ].join('\n');

    return csvContent;
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Méthode pour données mock (gardée pour tests)
  loadMockData() {
    const mockProducts: Product[] = [];
    for (let i = 1; i <= 15; i++) {
      mockProducts.push({
        id: i,
        nom: `Produit ${i}`,
        prix: Math.floor(Math.random() * 100000) + 10000,
        description: `Description détaillée du produit ${i}. Ce produit offre une excellente qualité et performance pour tous vos besoins.`,
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
}
