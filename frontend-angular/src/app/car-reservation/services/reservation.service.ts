import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Produit {
  id: number;
  nom: string;
  prix: number;
  description: string;
  couleur?: string;
  annee?: number;
  quantite: number;
  categorie: string;
  marque: string;
  imageUrl?: string;
  imagePublicId?: string;
}

export interface ReservationRequest {
  produitId: number;
  dateDepart: string;
  dateRetour: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  lieuPrise: string;
  lieuRetour: string;
  prixTotal: number;
  nombreJours: number;
}

export interface Reservation {
  id: number;
  dateDepart: string;
  dateRetour: string;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  lieuPrise: string;
  lieuRetour: string;
  prixTotal: number;
  nombreJours: number;
  statut: string;
  statutLabel: string;
  dateCreation: string;
  produit: {
    id: number;
    nom: string;
    marque: string;
    categorie: string;
    imageUrl?: string;
  };
}

export interface ReservationResponse {
  success: boolean;
  message: string;
  reservation: Reservation;
}

export interface DisponibiliteResponse {
  disponible: boolean;
  vehiculesDisponibles: number;
  quantiteTotal: number;
}

export interface PaginatedResponse<T> {
  content?: T[];
  reservations?: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationService {

  private apiUrl = `${environment.apiUrl}/api`;

  constructor(private http: HttpClient) { }

  // Créer une réservation
  createReservation(reservation: ReservationRequest): Observable<ReservationResponse> {
    return this.http.post<ReservationResponse>(`${this.apiUrl}/reservations`, reservation);
  }

  // Récupérer toutes les réservations (admin)
  getAllReservations(page: number = 0, size: number = 10, email?: string): Observable<PaginatedResponse<Reservation>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (email) {
      params = params.set('email', email);
    }

    return this.http.get<PaginatedResponse<Reservation>>(`${this.apiUrl}/reservations`, { params });
  }

  // Récupérer une réservation par ID
  getReservation(id: number): Observable<Reservation> {
    return this.http.get<Reservation>(`${this.apiUrl}/reservations/${id}`);
  }

  // Récupérer les réservations d'un client
  getClientReservations(email: string): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/reservations/client/${email}`);
  }

  // Modifier le statut d'une réservation (admin)
  updateReservationStatus(id: number, statut: string): Observable<ReservationResponse> {
    return this.http.put<ReservationResponse>(`${this.apiUrl}/reservations/${id}/statut`, { statut });
  }

  // Supprimer une réservation (admin)
  deleteReservation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/reservations/${id}`);
  }

  // Vérifier la disponibilité d'un produit
  verifierDisponibilite(produitId: number, dateDepart: string, dateRetour: string): Observable<DisponibiliteResponse> {
    const params = new HttpParams()
      .set('dateDepart', dateDepart)
      .set('dateRetour', dateRetour);

    return this.http.get<DisponibiliteResponse>(`${this.apiUrl}/reservations/disponibilite/${produitId}`, { params });
  }

  // Récupérer un produit
  getProduit(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/produits/${id}`);
  }

  // Récupérer tous les produits avec pagination et recherche
  getAllProduits(page: number = 0, size: number = 10, keyword: string = ''): Observable<PaginatedResponse<Produit>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('keyword', keyword);

    return this.http.get<PaginatedResponse<Produit>>(`${this.apiUrl}/produits`, { params });
  }
}
