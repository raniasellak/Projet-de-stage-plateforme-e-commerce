import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReservationsService, Reservation } from 'src/app/reservations/services/reservations.service';

@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css'
})
export class Reservations implements OnInit {
  reservations: Reservation[] = [];
  totalItems = 0;
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  isLoading = false;

  // Filtres
  searchTerm = '';
  statusFilter = '';
  dateFilter = '';

  constructor(public reservationsService: ReservationsService) {}

  ngOnInit(): void {
    this.loadReservations();
  }

  loadReservations(page: number = 0): void {
    this.isLoading = true;
    this.reservationsService.getAllReservations(page, this.pageSize).subscribe({
      next: (data: any) => {
        this.reservations = data.reservations;
        this.totalItems = data.totalItems;
        this.currentPage = data.currentPage;
        this.totalPages = data.totalPages;
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Erreur chargement réservations', err);
        this.isLoading = false;
      }
    });
  }

  supprimer(id: number): void {
    if (confirm('Voulez-vous vraiment supprimer cette réservation ?')) {
      this.reservationsService.deleteReservation(id).subscribe({
        next: () => {
          this.loadReservations(this.currentPage);
        },
        error: (err) => {
          console.error('Erreur lors de la suppression', err);
        }
      });
    }
  }

  changerStatut(id: number, statut: string): void {
    this.reservationsService.updateStatus(id, statut).subscribe({
      next: () => {
        this.loadReservations(this.currentPage);
      },
      error: (err) => {
        console.error('Erreur lors du changement de statut', err);
      }
    });
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.loadReservations(page);
    }
  }

  // Méthodes utilitaires pour le template
  trackByReservationId(index: number, reservation: Reservation): number {
    return reservation.id;
  }

  getStatusClass(status: string): string {
    const baseClass = 'status-badge ';
    switch (status.toLowerCase()) {
      case 'en attente':
        return baseClass + 'status-en-attente';
      case 'confirmée':
        return baseClass + 'status-confirmee';
      case 'annulée':
        return baseClass + 'status-annulee';
      default:
        return baseClass + 'status-en-attente';
    }
  }

  getStatusIcon(status: string): string {
    switch (status.toLowerCase()) {
      case 'en attente':
        return 'fas fa-clock';
      case 'confirmée':
        return 'fas fa-check-circle';
      case 'annulée':
        return 'fas fa-times-circle';
      default:
        return 'fas fa-clock';
    }
  }

  getReservationsByStatus(status: string): Reservation[] {
    return this.reservations.filter(r =>
      r.statutLabel.toLowerCase() === status.toLowerCase().replace('_', ' ')
    );
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  // Méthodes de filtrage (à implémenter selon vos besoins)
  onSearch(): void {
    // Implémentez la logique de recherche
    console.log('Recherche:', this.searchTerm);
  }

  onFilterChange(): void {
    // Implémentez la logique de filtrage
    console.log('Filtre statut:', this.statusFilter);
    console.log('Filtre date:', this.dateFilter);
  }
}
