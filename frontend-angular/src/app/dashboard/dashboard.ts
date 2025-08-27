import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// ✅ Import des types depuis le bon chemin
import { DashboardService } from './services/dashboard.service';
import {
  DashboardStats,
  ReservationSummary,
  VehicleAlert
} from './models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {

  stats: DashboardStats = {
    totalVehicles: 0,
    availableVehicles: 0,
    rentedVehicles: 0,
    maintenanceVehicles: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    activeReservations: 0,
    newCustomers: 0
  };

  recentReservations: ReservationSummary[] = [];
  alerts: VehicleAlert[] = [];
  loading = true;
  error: string | null = null;

  // Colonnes pour le tableau des réservations
  displayedColumns: string[] = ['customerName', 'vehicleModel', 'startDate', 'status', 'totalAmount'];

  constructor(
    private dashboardService: DashboardService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();

    // Actualisation automatique toutes les 5 minutes
    setInterval(() => this.loadDashboardData(), 300000);
  }

  loadDashboardData(): void {
    this.loading = true;
    this.error = null;

    // Charger les statistiques - ✅ Types explicites
    this.dashboardService.getStats().subscribe({
      next: (stats: DashboardStats) => {
        this.stats = stats;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des stats:', error);
        this.showError('Erreur lors du chargement des statistiques');
      }
    });

    // Charger les réservations récentes - ✅ Types explicites
    this.dashboardService.getRecentReservations().subscribe({
      next: (reservations: ReservationSummary[]) => {
        this.recentReservations = reservations;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des réservations:', error);
      }
    });

    // Charger les alertes - ✅ Types explicites
    this.dashboardService.getAlerts().subscribe({
      next: (alerts: VehicleAlert[]) => {
        this.alerts = alerts;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des alertes:', error);
        this.loading = false;
      }
    });
  }

  refreshData(): void {
    this.loadDashboardData();
    this.snackBar.open('Données actualisées', 'OK', { duration: 2000 });
  }

  getStatusColor(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'primary';
      case 'pending': return 'accent';
      case 'completed': return 'primary';
      case 'cancelled': return 'warn';
      default: return 'primary';
    }
  }

  getStatusText(status: string): string {
    switch (status.toLowerCase()) {
      case 'active': return 'Active';
      case 'pending': return 'En attente';
      case 'completed': return 'Terminée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  }

  getAlertColor(priority: string): string {
    switch (priority.toLowerCase()) {
      case 'high': return 'warn';
      case 'medium': return 'accent';
      case 'low': return 'primary';
      default: return 'primary';
    }
  }

  private showError(message: string): void {
    this.error = message;
    this.snackBar.open(message, 'Fermer', { duration: 5000 });
  }
}


