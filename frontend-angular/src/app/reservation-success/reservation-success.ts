import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../car-reservation/services/reservation.service';

@Component({
  selector: 'app-reservation-success',
  standalone: true,
  templateUrl: './reservation-success.html',
  styleUrls: ['./reservation-success.css'],
  imports: [CommonModule]
})
export class ReservationSuccess implements OnInit {

  reservation: any = null;
  loading = true;
  error: string | null = null;
  contractGenerating = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const reservationId = params['id'];
      if (reservationId) {
        this.loadReservation(+reservationId);
      } else {
        this.error = 'ID de réservation manquant';
        this.loading = false;
      }
    });
  }

  loadReservation(id: number): void {
    this.loading = true;
    this.reservationService.getReservation(id).subscribe({
      next: (reservation: any) => {
        this.reservation = reservation;
        this.loading = false;

        // Envoyer automatiquement l'email de confirmation
        this.sendConfirmationEmail();
      },
      error: (error: any) => {
        this.error = 'Erreur lors du chargement de la réservation';
        this.loading = false;
      }
    });
  }

  sendConfirmationEmail(): void {
    if (this.reservation) {
      this.reservationService.sendConfirmationEmail(this.reservation.id).subscribe({
        next: (response: any) => {
          console.log('Email de confirmation envoyé');
        },
        error: (error: any) => {
          console.log('Erreur lors de l\'envoi de l\'email');
        }
      });
    }
  }

  downloadContract(): void {
    if (!this.reservation) return;

    this.contractGenerating = true;

    this.reservationService.generateContract(this.reservation.id).subscribe({
      next: (blob: Blob) => {
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `contrat-location-${this.reservation.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        this.contractGenerating = false;
      },
      error: (error: any) => {
        console.error('Erreur lors de la génération du contrat:', error);
        this.contractGenerating = false;
      }
    });
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goToHomePage(): void {
    this.router.navigate(['/']);
  }

  viewMyReservations(): void {
    if (this.reservation) {
      this.router.navigate(['/mes-reservations'], {
        queryParams: { email: this.reservation.email }
      });
    }
  }

  contactSupport(): void {
    // Redirection vers page de contact ou ouverture d'email
    window.location.href = 'mailto:support@example.com?subject=Question sur la réservation #' + this.reservation?.id;
  }
}
