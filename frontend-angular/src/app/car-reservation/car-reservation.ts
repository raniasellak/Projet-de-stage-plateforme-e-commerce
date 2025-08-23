import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Reservation } from './models/reservation';
import { environment } from 'src/environments/environment';


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

// Interface pour la réponse de mise à jour de statut
export interface UpdateStatusResponse {
  success: boolean;
  message: string;
  reservation: {
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
  };
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

@Component({
  selector: 'app-car-reservation',
  standalone: true,
  templateUrl: './car-reservation.html',
  styleUrls: ['./car-reservation.css'],
  imports: [CommonModule, FormsModule]
})
export class CarReservation implements OnInit {

  private apiUrl = 'http://localhost:8085/api';

  produit: Produit | null = null;
  loading = true;
  submitting = false;
  error: string | null = null;

  // Données du formulaire
  selectedDates = {
    dateDepart: '',
    dateRetour: ''
  };

  reservationData = {
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    lieuPrise: '',
    lieuRetour: ''
  };

  // Calendrier
  currentMonth = new Date();
  showCalendar: 'dateDepart' | 'dateRetour' | null = null;

  // Options de lieux
  lieux = [
    { value: 'casablanca-centre', label: 'Casablanca Centre' },
    { value: 'aeroport-mohammed-v', label: 'Aéroport Mohammed V' },
    { value: 'gare-casa-port', label: 'Gare Casa Port' },
    { value: 'ain-diab', label: 'Ain Diab' }
  ];

  monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const productId = +params['id'];
      if (productId) {
        this.loadProduit(productId);
      }
    });
  }

  loadProduit(id: number): void {
    this.loading = true;
    this.error = null;

    this.getProduit(id).subscribe({
      next: (produit) => {
        this.produit = produit;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.error = 'Erreur lors du chargement du produit';
        this.loading = false;
      }
    });
  }

  getProduit(id: number): Observable<Produit> {
    return this.http.get<Produit>(`${this.apiUrl}/produits/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Méthodes du calendrier
  getDaysInMonth(date: Date): { date: Date, isCurrentMonth: boolean }[] {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDay.getDay();

    const days: { date: Date, isCurrentMonth: boolean }[] = [];

    // Jours du mois précédent
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i);
      days.push({ date: day, isCurrentMonth: false });
    }

    // Jours du mois actuel
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({ date, isCurrentMonth: true });
    }

    return days;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR');
  }

  handleDateSelect(date: Date, type: 'dateDepart' | 'dateRetour'): void {
    const formattedDate = date.toISOString().split('T')[0];
    this.selectedDates[type] = formattedDate;
    this.showCalendar = null;
  }

  toggleCalendar(type: 'dateDepart' | 'dateRetour'): void {
    this.showCalendar = this.showCalendar === type ? null : type;
  }

  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1
    );
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1
    );
  }

  isDateSelected(date: Date, type: 'dateDepart' | 'dateRetour'): boolean {
    return this.selectedDates[type] === date.toISOString().split('T')[0];
  }

  isDateDisabled(date: Date): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  // Calculs
  get nombreJours(): number {
    if (this.selectedDates.dateDepart && this.selectedDates.dateRetour) {
      const depart = new Date(this.selectedDates.dateDepart);
      const retour = new Date(this.selectedDates.dateRetour);
      return Math.ceil((retour.getTime() - depart.getTime()) / (1000 * 60 * 60 * 24));
    }
    return 0;
  }

  get prixTotal(): number {
    if (this.produit && this.nombreJours > 0) {
      return this.produit.prix * this.nombreJours;
    }
    return 0;
  }

  // Validation
  get isFormValid(): boolean {
    return !!(
      this.selectedDates.dateDepart &&
      this.selectedDates.dateRetour &&
      this.reservationData.nom.trim() &&
      this.reservationData.prenom.trim() &&
      this.reservationData.telephone.trim() &&
      this.reservationData.email.trim() &&
      this.reservationData.lieuPrise &&
      this.reservationData.lieuRetour &&
      this.nombreJours > 0
    );
  }

  // Soumission
  onSubmit(): void {
    if (!this.isFormValid || !this.produit) {
      return;
    }

    this.submitting = true;
    this.error = null;

    const reservationRequest: ReservationRequest = {
      produitId: this.produit.id,
      dateDepart: this.selectedDates.dateDepart,
      dateRetour: this.selectedDates.dateRetour,
      nom: this.reservationData.nom.trim(),
      prenom: this.reservationData.prenom.trim(),
      telephone: this.reservationData.telephone.trim(),
      email: this.reservationData.email.trim(),
      lieuPrise: this.reservationData.lieuPrise,
      lieuRetour: this.reservationData.lieuRetour,
      prixTotal: this.prixTotal,
      nombreJours: this.nombreJours
    };

    this.createReservation(reservationRequest).subscribe({
      next: (response: any) => {
        console.log('Réservation créée:', response);
       const reservationId = response?.reservation?.id || response?.id;
               if (reservationId) {
        this.router.navigate(['/reservation-confirmation'], {
          queryParams: { id: response.reservation.id }
        });
             } else {
               // Fallback si l'ID n'est pas dans la structure attendue
               this.router.navigate(['/reservation-confirmation'], {
                 queryParams: { id: response.id || response.reservation?.id }
               });
             }
           },
      error: (error: any) => {
        console.error('Erreur lors de la réservation:', error);
        this.error = 'Erreur lors de la création de la réservation. Veuillez réessayer.';
        this.submitting = false;
      }
    });
  }

  createReservation(reservation: ReservationRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/reservations`, reservation)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';

    if (error.error instanceof ErrorEvent) {
      // Erreur côté client
      errorMessage = error.error.message;
    } else {
      // Erreur côté serveur
      errorMessage = error.error?.message || `Erreur ${error.status}: ${error.message}`;
    }

    return throwError(() => errorMessage);
  }

  // Méthodes utilitaires pour le template
  getLieuLabel(value: string): string {
    const lieu = this.lieux.find(l => l.value === value);
    return lieu ? lieu.label : value;
  }

  onInputChange(field: string, value: string): void {
    (this.reservationData as any)[field] = value;
  }
formatFromString(dateString: string): string {
  return dateString ? new Date(dateString).toLocaleDateString('fr-FR') : '';
}



}
