import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost:8085/api';

  constructor(private http: HttpClient) {}



  // Récupérer la liste des produits avec pagination et recherche (optionnel)
  getProducts(page: number = 0, size: number = 10, keyword: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('keyword', keyword);

    return this.http.get<any>(`${this.apiUrl}/produits`, { params });
  }

  // Ajouter un produit avec image (formData)
  addProductWithImage(formData: FormData): Observable<any> {
     return this.http.post(`${this.apiUrl}/produits-with-image`, formData);
   }

 // NOUVELLE MÉTHODE: Modifier un produit avec image
   updateProductWithImage(id: number, formData: FormData): Observable<any> {
     return this.http.put(`${this.apiUrl}/produits-with-image/${id}`, formData);
   }

   // NOUVELLE MÉTHODE: Modifier un produit sans image (juste les données)
   updateProduct(id: number, product: Product): Observable<Product> {
     return this.http.put<Product>(`${this.apiUrl}/produits/${id}`, product);
   }


  // Supprimer un produit par id
  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/produits/${id}`);
  }
// Récupérer un produit par son id
getProductById(id: number): Observable<Product> {
  return this.http.get<Product>(`${this.apiUrl}/produits/${id}`);
}


}
