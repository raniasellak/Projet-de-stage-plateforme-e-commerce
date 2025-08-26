import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Reservation {
  id: number;
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
  dateDepart: string;
  dateRetour: string;
  dateCreation: string;
  produit: {
    id: number;
    nom: string;
    marque: string;
    categorie: string;
    imageUrl: string;
  };
}

export interface ReservationResponse {
  reservations: Reservation[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationsService {
  private apiUrl = 'http://localhost:8085/api/reservations';

  constructor(private http: HttpClient) {}

  getAllReservations(page: number = 0, size: number = 10): Observable<ReservationResponse> {
    return this.http.get<ReservationResponse>(`${this.apiUrl}?page=${page}&size=${size}`);
  }

  deleteReservation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateStatus(id: number, statut: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/statut`, { statut });
  }
}
