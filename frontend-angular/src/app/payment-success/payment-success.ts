import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../car-reservation/services/reservation.service';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.css'],
  imports: [CommonModule]
})
export class PaymentSuccess implements OnInit {

  reservationId?: number;


  loading = true;
  error: string | null = null;
  success = false;
  reservation: any = null;
  paypalOrderId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Récupérer les paramètres de l'URL de retour PayPal
    this.route.queryParams.subscribe(params => {
      const token = params['token']; // PayPal order ID
      const payerId = params['PayerID']; // PayPal payer ID
      const reservationId = params['reservationId'];

      console.log('PayPal return params:', { token, payerId, reservationId });

      if (token && payerId) {
        this.paypalOrderId = token;
        this.capturePayPalPayment(token);
      } else {
        this.error = 'Paramètres de paiement manquants';
        this.loading = false;
      }
    });
  }

  capturePayPalPayment(orderId: string): void {
    this.loading = true;
    this.error = null;

    this.reservationService.capturePayPalPayment(orderId).subscribe({
      next: (response: any) => {
        console.log('PayPal capture response:', response);
        if (response.success) {
          this.success = true;
          this.reservation = response.reservation;
          this.loading = false;
        } else {
          this.error = response.message || 'Erreur lors de la capture du paiement';
          this.loading = false;
        }
      },
      error: (error: any) => {
        console.error('Erreur capture PayPal:', error);
        this.error = 'Erreur lors de la confirmation du paiement PayPal';
        this.loading = false;
      }
    });
  }

  goToReservation(): void {
    if (this.reservation) {
      this.router.navigate(['/reservation-confirmation'], {
        queryParams: { id: this.reservation.id }
      });
    }
  }

  goToMyReservations(): void {
    if (this.reservation) {
      this.router.navigate(['/mes-reservations'], {
        queryParams: { email: this.reservation.email }
      });
    }
  }

  goToProducts(): void {
    this.router.navigate(['/produits']);
  }

returnToReservation() {
  this.router.navigate(['/reservation']);
}

}
