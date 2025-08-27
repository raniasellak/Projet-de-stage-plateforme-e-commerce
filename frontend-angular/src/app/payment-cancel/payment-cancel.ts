import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../car-reservation/services/reservation.service';

@Component({
  selector: 'app-payment-cancel',
  standalone: true,
  templateUrl: './payment-cancel.html',
  styleUrls: ['./payment-cancel.css'],
  imports: [CommonModule]
})
export class PaymentCancel implements OnInit {

  reservationId: number | null = null;
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de réservation depuis les paramètres
    this.route.queryParams.subscribe(params => {
      this.reservationId = params['reservationId'] ? +params['reservationId'] : null;

      // Optionnel : marquer le paiement comme annulé côté serveur
      if (this.reservationId) {
        this.markPaymentAsCancelled();
      }
    });
  }

  markPaymentAsCancelled(): void {
    if (!this.reservationId) return;

    this.loading = true;
    this.reservationService.cancelPayPalPayment(this.reservationId).subscribe({
      next: (response: any) => {
        console.log('Payment marked as cancelled');
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error marking payment as cancelled:', error);
        this.loading = false;
      }
    });
  }

  returnToReservation(): void {
    if (this.reservationId) {
      this.router.navigate(['/reservation-confirmation'], {
        queryParams: { id: this.reservationId }
      });
    } else {
      this.router.navigate(['/produits']);
    }
  }

  goToProducts(): void {
    this.router.navigate(['/produits']);
  }
}
