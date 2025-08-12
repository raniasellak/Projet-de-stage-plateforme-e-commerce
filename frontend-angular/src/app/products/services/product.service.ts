import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Product, ProductResponse } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8085/api';

  constructor(private http: HttpClient) {}

  // Récupérer la liste des produits avec pagination et recherche
  getProducts(page: number = 0, size: number = 10, keyword: string = ''): Observable<ProductResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('keyword', keyword);

    return this.http.get<ProductResponse>(`${this.apiUrl}/produits`, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Récupérer un produit par son id
  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/produits/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Ajouter un produit avec image (FormData) - avec headers explicites
  addProductWithImage(formData: FormData): Observable<Product> {
    // Ne pas définir Content-Type, laissez Angular/HttpClient le faire automatiquement pour FormData
    return this.http.post<Product>(`${this.apiUrl}/produits-with-image`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Modifier un produit avec nouvelle image (FormData)
  updateProductWithImage(id: number, formData: FormData): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/produits-with-image/${id}`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Modifier un produit sans changer l'image (JSON)
  updateProduct(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/produits/${id}`, product)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Supprimer un produit
  deleteProduct(id: number): Observable<{success: string, message: string}> {
    return this.http.delete<{success: string, message: string}>(`${this.apiUrl}/produits/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Upload d'image séparée (optionnel)
  uploadImage(file: File): Observable<{secure_url: string, public_id: string}> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{secure_url: string, public_id: string}>(`${this.apiUrl}/upload`, formData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Tester la connexion API
  testConnection(): Observable<string> {
    return this.http.get<string>(`${this.apiUrl}/test`)
      .pipe(
        catchError(this.handleError)
      );
  }

 private handleError(error: HttpErrorResponse) {
   let errorMessage = 'Une erreur inconnue s\'est produite';

   console.error('Erreur HTTP complète:', error);

   if (error.error instanceof ErrorEvent) {
     // Erreur côté client
     errorMessage = `Erreur: ${error.error.message}`;
   } else {
     // Erreur côté serveur
     console.error('Status:', error.status);
     console.error('Error body:', error.error);

     // Si l'erreur contient un message spécifique du serveur
     if (error.error && typeof error.error === 'string') {
       errorMessage = error.error;
     } else if (error.error && error.error.message) {
       errorMessage = error.error.message;
     } else {
       // Messages d'erreur selon le code de statut
       switch (error.status) {
         case 400:
           errorMessage = 'Données invalides. Vérifiez votre formulaire.';
           break;
         case 401:
           errorMessage = 'Non autorisé. Connectez-vous.';
           break;
         case 403:
           errorMessage = 'Accès refusé.';
           break;
         case 404:
           errorMessage = 'Ressource non trouvée.';
           break;
         case 500:
           errorMessage = 'Erreur interne du serveur. Contactez l\'administrateur.';
           break;
         default:
           errorMessage = `Erreur ${error.status}: ${error.message}`;
       }
     }
   }

   console.error('Message d\'erreur final:', errorMessage);
   return throwError(() => new Error(errorMessage));
 }
}
