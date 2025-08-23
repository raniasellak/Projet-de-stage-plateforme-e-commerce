import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReservationService } from '../car-reservation/services/reservation.service';


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
export class ReservationConfirmationComponent implements OnInit {

  reservation: ReservationConfirmation | null = null;
  loading = true;
  error: string | null = null;
  processingPayment = false;

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

  // Méthode pour traiter le paiement
  processPayment(): void {
    if (!this.reservation) return;

    this.processingPayment = true;

    // Préparer la demande de paiement
    const paymentRequest = {
      reservationId: this.reservation.id,
      amount: this.reservation.prixTotal,
      currency: 'EUR',
      paymentMethod: 'card' // Ou selon votre système
    };

    // Initier le paiement
    this.reservationService.initiatePayment(paymentRequest).subscribe({
      next: (paymentResponse) => {
        if (paymentResponse.success) {
          // Si le paiement nécessite une redirection (ex: PayPal, Stripe)
          if (paymentResponse.paymentUrl) {
            window.location.href = paymentResponse.paymentUrl;
          } else {
            // Paiement direct réussi, confirmer immédiatement
            this.confirmPayment(paymentResponse.transactionId!);
          }
        } else {
          this.handlePaymentError(paymentResponse.message);
        }
      },
      error: (error) => {
        this.handlePaymentError('Erreur lors de l\'initiation du paiement');
      }
    });
  }

  // Confirmer le paiement
  private confirmPayment(transactionId: string): void {
    if (!this.reservation) return;

    this.reservationService.confirmPayment(transactionId, this.reservation.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.reservation = response.reservation;
          this.processingPayment = false;
          this.showPaymentSuccess();
        } else {
          this.handlePaymentError(response.message);
        }
      },
      error: (error) => {
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

  // Mettre à jour le statut de la réservation
  private updateReservationStatus(nouveauStatut: string): void {
    if (!this.reservation) return;

    this.reservationService.updateReservationStatus(this.reservation.id, nouveauStatut)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.reservation = response.reservation;
            this.processingPayment = false;
            // Redirection vers la page de succès ou mise à jour de l'affichage
            this.showPaymentSuccess();
          }
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du statut:', error);
          this.processingPayment = false;
          this.error = 'Erreur lors du traitement du paiement';
        }
      });
  }

  private showPaymentSuccess(): void {
    // Ici vous pouvez soit :
    // 1. Afficher un message de succès sur la même page
    // 2. Rediriger vers une page de succès dédiée
    // 3. Télécharger/afficher le contrat de location

    // Exemple : redirection vers une page de succès
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

  // Annuler la réservation (optionnel)
  cancelReservation(): void {
    if (!this.reservation) return;

    if (confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      this.updateReservationStatus('ANNULEE');
    }
  }

  // Modifier la réservation (optionnel)
  modifyReservation(): void {
    if (!this.reservation) return;

    // Redirection vers le formulaire de réservation avec les données pré-remplies
    this.router.navigate(['/car-reservation', this.reservation.produit.id], {
      queryParams: {
        modify: this.reservation.id,
        dateDepart: this.reservation.dateDepart,
        dateRetour: this.reservation.dateRetour
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
