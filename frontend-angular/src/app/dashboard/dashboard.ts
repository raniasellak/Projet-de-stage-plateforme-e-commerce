// dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatBadgeModule } from '@angular/material/badge';
import { Chart,ChartConfiguration, ChartData , registerables} from 'chart.js';
import { NgChartsModule } from 'ng2-charts';

import { DashboardService } from 'src/app/dashboard/services/dashboard.service';
import {
  DashboardData,
  DashboardFilters,
  MonthlyRevenue,
  StatCard,
  ReservationStats
} from 'src/app/dashboard/models/dashboard.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressBarModule,
    MatSelectModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatChipsModule,
    MatTableModule,
    MatBadgeModule,
    NgChartsModule
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {

  private destroy$ = new Subject<void>();

  dashboardData: DashboardData | null = null;
  loading = true;

  // Filtres
  selectedPeriod = 'mois';

  // Données pour les graphiques
  revenueChartData: ChartData<'line'> = { labels: [], datasets: [] };
  reservationStatusChartData: ChartData<'doughnut'> = { labels: [], datasets: [] };

  // Configuration des graphiques
  revenueChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    interaction: { mode: 'nearest', axis: 'x', intersect: false },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function (value: any) {
            return value + ' €';
          }
        }
      }
    }
  };

  statusChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' }
    }
  };

  displayedColumns: string[] = ['client', 'vehicule', 'dates', 'statut', 'montant'];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit(): void {
    this.loadDashboardData();

    // Rafraîchir les données toutes les 5 minutes
    setInterval(() => this.refreshData(), 5 * 60 * 1000);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboardData(): void {
    this.loading = true;

    this.dashboardService.getDashboardData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.dashboardData = data;
          this.setupCharts();
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Erreur lors du chargement du dashboard:', error);
          this.loading = false;
        }
      });
  }

  refreshData(): void {
    this.dashboardService.refreshDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          this.dashboardData = data;
          this.setupCharts();
        },
        error: (error: any) => {
          console.error('Erreur lors du rafraîchissement:', error);
        }
      });
  }

  private setupCharts(): void {
    if (!this.dashboardData) return;

    // Revenus mensuels
    this.revenueChartData = {
      labels: this.dashboardData.monthlyRevenue.map((m: MonthlyRevenue)  => m.mois),
      datasets: [
        {
          label: 'Revenus (€)',
          data: this.dashboardData.monthlyRevenue.map((m: MonthlyRevenue)  => m.revenus),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          fill: true
        },
        {
          label: 'Réservations',
          data: this.dashboardData.monthlyRevenue.map((m: MonthlyRevenue)  => m.reservations),
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          tension: 0.4,
          fill: true,
          yAxisID: 'y1'
        }
      ]
    };

    // Statuts
    const { reservationStats } = this.dashboardData;
    this.reservationStatusChartData = {
      labels: ['En attente', 'Confirmées', 'En cours', 'Terminées', 'Annulées'],
      datasets: [{
        data: [
          reservationStats.enAttente,
          reservationStats.confirmees,
          reservationStats.enCours,
          reservationStats.terminees,
          reservationStats.annulees
        ],
        backgroundColor: ['#ffc107', '#28a745', '#007bff', '#6c757d', '#dc3545'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    };

    // 2ème axe Y
    this.revenueChartOptions = {
      ...this.revenueChartOptions,
      scales: {
        ...this.revenueChartOptions?.scales,
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          beginAtZero: true,
          grid: { drawOnChartArea: false },
          ticks: {
            callback: function (value) {
              return value + ' rés.';
            }
          }
        }
      }
    };
  }

  getStatCards(): StatCard[] {
    if (!this.dashboardData) return [];

    const { stats } = this.dashboardData;
    return [
      {
        title: 'Total Réservations',
        value: stats.totalReservations,
        icon: 'event_note',
        color: 'primary',
        trend: { value: stats.nouvellesReservations, isPositive: true, period: 'dernières 24h' }
      },
      {
        title: 'Réservations Actives',
        value: stats.reservationsEnCours,
        icon: 'directions_car',
        color: 'accent',
        trend: { value: 15, isPositive: true, period: 'cette semaine' }
      },
      {
        title: 'Revenus du Mois',
        value: `${stats.chiffreAffaireMois.toLocaleString('fr-FR')} €`,
        icon: 'trending_up',
        color: 'success',
        trend: { value: 12.5, isPositive: true, period: 'vs mois dernier' }
      },
      {
        title: 'Taux d\'Occupation',
        value: `${stats.tauxOccupation}%`,
        icon: 'pie_chart',
        color: 'info',
        trend: {
          value: stats.tauxOccupation,
          isPositive: stats.tauxOccupation > 70,
          period: 'actuellement'
        }
      }
    ];
  }

  getStatusLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'CONFIRMEE': 'Confirmée',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée'
    };
    return labels[statut] || statut;
  }

  getStatusColor(statut: string): string {
    const colors: { [key: string]: string } = {
      'EN_ATTENTE': 'warn',
      'CONFIRMEE': 'primary',
      'EN_COURS': 'accent',
      'TERMINEE': 'basic',
      'ANNULEE': 'warn'
    };
    return colors[statut] || 'basic';
  }

  onPeriodChange(period: string): void {
    this.selectedPeriod = period;

    const filters: DashboardFilters = { periode: period as any };

    this.dashboardService.getDashboardData(filters)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.dashboardData = data;
          this.setupCharts();
        },
        error: (error) => {
          console.error('Erreur lors du changement de période:', error);
        }
      });
  }

  formatCurrency(value: number): string {
    return value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR');
  }

  getDatesString(dateDepart: Date, dateRetour: Date): string {
    return `${this.formatDate(dateDepart)} - ${this.formatDate(dateRetour)}`;
  }
}
