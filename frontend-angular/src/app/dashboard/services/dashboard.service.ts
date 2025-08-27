import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  DashboardStats,
  ReservationSummary,
  VehicleAlert
} from '../models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api/admin/dashboard';

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`)
      .pipe(catchError(this.handleError));
  }

  getRecentReservations(): Observable<ReservationSummary[]> {
    return this.http.get<ReservationSummary[]>(`${this.apiUrl}/recent-reservations`)
      .pipe(catchError(this.handleError));
  }

  getAlerts(): Observable<VehicleAlert[]> {
    return this.http.get<VehicleAlert[]>(`${this.apiUrl}/alerts`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    console.error('Erreur dans le service dashboard:', error);
    return throwError(() => error);
  }
}
