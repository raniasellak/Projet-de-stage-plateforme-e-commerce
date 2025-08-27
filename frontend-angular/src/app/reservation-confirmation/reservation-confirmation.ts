import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../car-reservation/services/reservation.service';
import { Reservation } from '../car-reservation/models/reservation';

export interface ReservationConfirmation {
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
  transactionId?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  produit: {
    id: number;
    nom: string;
    marque: string;
    categorie: string;
    imageUrl?: string;
  };
}

@Component({
  selector: 'app-reservation-confirmation',
  standalone: true,
  templateUrl: './reservation-confirmation.html',
  styleUrls: ['./reservation-confirmation.css'],
  imports: [CommonModule]
})
export class ReservationConfirmationComponent  implements OnInit {

  reservation: ReservationConfirmation | null = null;
  loading = true;
  error: string | null = null;
  processingPayment = false;
  paymentMethod: 'paypal' | 'card' | null = null;

  // Options de lieux pour l'affichage
  lieux = [
    { value: 'casablanca-centre', label: 'Casablanca Centre' },
    { value: 'aeroport-mohammed-v', label: 'Aéroport Mohammed V' },
    { value: 'gare-casa-port', label: 'Gare Casa Port' },
    { value: 'ain-diab', label: 'Ain Diab' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private reservationService: ReservationService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de la réservation depuis les paramètres de la route
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
    this.error = null;

    this.reservationService.getReservation(id).subscribe({
      next: (reservation) => {
        this.reservation = reservation;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la réservation:', error);
        this.error = 'Erreur lors du chargement de la réservation';
        this.loading = false;
      }
    });
  }

  // Sélectionner le mode de paiement
  selectPaymentMethod(method: 'paypal' | 'card'): void {
    this.paymentMethod = method;
  }

  // Traiter le paiement selon la méthode choisie
  processPayment(): void {
    if (!this.reservation) return;

    if (this.paymentMethod === 'paypal') {
      this.processPayPalPayment();
    } else if (this.paymentMethod === 'card') {
      this.processCardPayment();
    }
  }

  // Traitement paiement PayPal
  processPayPalPayment(): void {
    if (!this.reservation) return;

    this.processingPayment = true;
    this.error = null;

    const paypalRequest = {
      reservationId: this.reservation.id,
      amount: this.reservation.prixTotal,
      currency: 'EUR'
    };

    this.reservationService.initiatePayment(paypalRequest).subscribe({
      next: (response: any) => {
        console.log('PayPal payment initiated:', response);
        if (response.success && response.approvalUrl) {
          // Rediriger vers PayPal pour approbation
          window.location.href = response.approvalUrl;
        } else {
          this.handlePaymentError('Erreur lors de l\'initiation du paiement PayPal');
        }
      },
      error: (error: any) => {
        console.error('Erreur PayPal:', error);
        this.handlePaymentError('Erreur lors de l\'initiation du paiement PayPal');
      }
    });
  }

  // Traitement paiement par carte (simulation)
  processCardPayment(): void {
    if (!this.reservation) return;

    this.processingPayment = true;

    // Préparer la demande de paiement (simulation)
    const paymentRequest = {
      reservationId: this.reservation.id,
      amount: this.reservation.prixTotal,
      currency: 'EUR',
      paymentMethod: 'card'
    };

    // Simulation d'un paiement par carte
    this.reservationService.initiatePayment(paymentRequest).subscribe({
      next: (paymentResponse) => {
        if (paymentResponse.success) {
          // Paiement direct réussi
          this.confirmCardPayment(paymentResponse.transactionId!);
        } else {
          this.handlePaymentError(paymentResponse.message);
        }
      },
      error: (error: any) => {
        this.handlePaymentError('Erreur lors de l\'initiation du paiement par carte');
      }
    });
  }

  // Confirmer le paiement par carte
  private confirmCardPayment(transactionId: string): void {
    if (!this.reservation) return;

    this.reservationService.confirmPayment(transactionId, this.reservation.id).subscribe({
      next: (response:any) => {
        if (response.success) {
          this.reservation = response.reservation;
          this.processingPayment = false;
          this.showPaymentSuccess();
        } else {
          this.handlePaymentError(response.message);
        }
      },
      error: (error: any) => {
        this.handlePaymentError('Erreur lors de la confirmation du paiement');
      }
    });
  }

  // Gérer les erreurs de paiement
  private handlePaymentError(message: string): void {
    this.processingPayment = false;
    this.error = message;
    console.error('Erreur de paiement:', message);
  }

  private showPaymentSuccess(): void {
    // Redirection vers une page de succès
    setTimeout(() => {
      this.router.navigate(['/reservation-success'], {
        queryParams: { id: this.reservation?.id }
      });
    }, 1500);
  }

  // Méthodes utilitaires
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getLieuLabel(value: string): string {
    const lieu = this.lieux.find(l => l.value === value);
    return lieu ? lieu.label : value;
  }

  getStatutClass(statut: string): string {
    switch (statut) {
      case 'EN_ATTENTE': return 'statut-attente';
      case 'CONFIRMEE': return 'statut-confirmee';
      case 'EN_COURS': return 'statut-cours';
      case 'TERMINEE': return 'statut-terminee';
      case 'ANNULEE': return 'statut-annulee';
      default: return '';
    }
  }

  // Annuler la réservation
  cancelReservation(): void {
    if (!this.reservation) return;

    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.updateReservationStatus('ANNULEE');
    }
  }

  // Modifier la réservation
  modifyReservation(): void {
    if (!this.reservation) return;

    this.router.navigate(['/car-reservation', this.reservation.produit.id], {
      queryParams: {
        modify: this.reservation.id,
        dateDepart: this.reservation.dateDepart,
        dateRetour: this.reservation.dateRetour
      }
    });
  }

  // Mettre à jour le statut de la réservation
  private updateReservationStatus(nouveauStatut: string): void {
    if (!this.reservation) return;

    this.reservationService.updateReservationStatus(this.reservation.id, nouveauStatut)
      .subscribe({
        next: (response: any) => {
          if (response.success) {
            this.reservation = response.reservation;
          }
        },
        error: (error: any) => {
          console.error('Erreur lors de la mise à jour du statut:', error);
          this.error = 'Erreur lors du traitement';
        }
      });
  }

  // Retour à la liste des produits
  backToProducts(): void {
    this.router.navigate(['/produits']);
  }

  // Voir mes réservations
  viewMyReservations(): void {
    if (this.reservation) {
      this.router.navigate(['/mes-reservations'], {
        queryParams: { email: this.reservation.email }
      });
    }
  }
}
