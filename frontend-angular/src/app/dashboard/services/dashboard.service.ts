// dashboard/services/dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  DashboardData,
  DashboardStats,
  ReservationStats,
  MonthlyRevenue,
  VehicleStats,
  PopularVehicle,
  ClientStats,
  RecentReservation,
  DashboardFilters,
  Reservation
} from 'src/app/dashboard/models/dashboard.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = 'http://localhost:8085/api';

  constructor(private http: HttpClient ) { }

  // Méthode principale pour récupérer toutes les données du dashboard
  getDashboardData(filters?: DashboardFilters): Observable<DashboardData> {
    return forkJoin({
      reservations: this.getAllReservations(),
      vehicules: this.getAllVehicules()
    }).pipe(
      map(data => this.transformToDashboardData(data.reservations, data.vehicules)),
      catchError(error => {
        console.error('Erreur lors du chargement du dashboard:', error);
        return of(this.getEmptyDashboardData());
      })
    );
  }
refreshDashboard(): Observable<DashboardData> {
  return this.getDashboardData();
}


  // Récupérer toutes les réservations
  private getAllReservations(): Observable<any[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '1000'); // Récupérer un grand nombre pour les statistiques

    return this.http.get<any>(`${this.apiUrl}/reservations`, { params })
      .pipe(
        map(response => response.reservations || []),
        catchError(() => of([]))
      );
  }

  // Récupérer tous les véhicules
  private getAllVehicules(): Observable<any[]> {
    const params = new HttpParams()
      .set('page', '0')
      .set('size', '1000');

    return this.http.get<any>(`${this.apiUrl}/produits`, { params })
      .pipe(
        map(response => response.produits || []),
        catchError(() => of([]))
      );
  }

  // Transformer les données brutes en données du dashboard
  private transformToDashboardData(reservations: any[], vehicules: any[]): DashboardData {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculer les statistiques principales
    const stats = this.calculateMainStats(reservations, vehicules, now);

    // Calculer les statistiques des réservations par statut
    const reservationStats = this.calculateReservationStats(reservations);

    // Calculer les revenus mensuels
    const monthlyRevenue = this.calculateMonthlyRevenue(reservations);

    // Calculer les statistiques des véhicules
    const vehicleStats = this.calculateVehicleStats(vehicules, reservations);

    // Calculer les véhicules populaires
    const popularVehicles = this.calculatePopularVehicles(reservations, vehicules);

    // Calculer les statistiques clients
    const clientStats = this.calculateClientStats(reservations);

    // Récupérer les réservations récentes
    const recentReservations = this.getRecentReservations(reservations);

    return {
      stats,
      reservationStats,
      monthlyRevenue,
      vehicleStats,
      popularVehicles,
      clientStats,
      recentReservations
    };
  }

  private calculateMainStats(reservations: any[], vehicules: any[], now: Date): DashboardStats {
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Réservations du mois en cours
    const reservationsMoisActuel = reservations.filter(r => {
      const dateCreation = new Date(r.dateCreation);
      return dateCreation.getMonth() === currentMonth &&
             dateCreation.getFullYear() === currentYear;
    });

    // Réservations en cours (entre date départ et retour)
    const reservationsEnCours = reservations.filter(r => {
      const dateDepart = new Date(r.dateDepart);
      const dateRetour = new Date(r.dateRetour);
      return now >= dateDepart && now <= dateRetour && r.statut === 'CONFIRMEE';
    }).length;

    // Nouvelles réservations (dernières 24h)
    const hier = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const nouvellesReservations = reservations.filter(r =>
      new Date(r.dateCreation) >= hier
    ).length;

    // Chiffre d'affaire du mois
    const chiffreAffaireMois = reservationsMoisActuel
      .filter(r => r.statut !== 'ANNULEE')
      .reduce((sum, r) => sum + (r.prixTotal || 0), 0);

    // Véhicules disponibles
    const vehiculesDisponibles = vehicules.filter(v => v.quantite > 0).length;

    // Taux d'occupation (approximatif)
    const totalVehicules = vehicules.reduce((sum, v) => sum + v.quantite, 0);
    const vehiculesLoues = reservationsEnCours;
    const tauxOccupation = totalVehicules > 0 ? (vehiculesLoues / totalVehicules) * 100 : 0;

    return {
      totalReservations: reservations.length,
      reservationsEnCours,
      nouvellesReservations,
      chiffreAffaireMois,
      vehiculesDisponibles,
      tauxOccupation: Math.round(tauxOccupation)
    };
  }

  private calculateReservationStats(reservations: any[]): ReservationStats {
    const stats = {
      enAttente: 0,
      confirmees: 0,
      enCours: 0,
      terminees: 0,
      annulees: 0
    };

    const now = new Date();

    reservations.forEach(r => {
      const dateDepart = new Date(r.dateDepart);
      const dateRetour = new Date(r.dateRetour);

      switch (r.statut) {
        case 'EN_ATTENTE':
          stats.enAttente++;
          break;
        case 'CONFIRMEE':
          if (now < dateDepart) {
            stats.confirmees++;
          } else if (now >= dateDepart && now <= dateRetour) {
            stats.enCours++;
          } else {
            stats.terminees++;
          }
          break;
        case 'ANNULEE':
          stats.annulees++;
          break;
        default:
          if (now > dateRetour) {
            stats.terminees++;
          }
      }
    });

    return stats;
  }

  private calculateMonthlyRevenue(reservations: any[]): MonthlyRevenue[] {
    const monthlyData: { [key: string]: MonthlyRevenue } = {};

    // Initialiser les 12 derniers mois
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });

      monthlyData[key] = {
        mois: monthName,
        revenus: 0,
        reservations: 0
      };
    }

    // Calculer les revenus par mois
    reservations
      .filter(r => r.statut !== 'ANNULEE')
      .forEach(r => {
        const date = new Date(r.dateCreation);
        const key = `${date.getFullYear()}-${date.getMonth()}`;

        if (monthlyData[key]) {
          monthlyData[key].revenus += r.prixTotal || 0;
          monthlyData[key].reservations++;
        }
      });

    return Object.values(monthlyData);
  }

  private calculateVehicleStats(vehicules: any[], reservations: any[]): VehicleStats {
    const now = new Date();
    const totalVehicules = vehicules.reduce((sum, v) => sum + v.quantite, 0);

    // Calculer les véhicules actuellement loués
    const vehiculesLoues = reservations.filter(r => {
      const dateDepart = new Date(r.dateDepart);
      const dateRetour = new Date(r.dateRetour);
      return now >= dateDepart && now <= dateRetour && r.statut === 'CONFIRMEE';
    }).length;

    const vehiculesDisponibles = totalVehicules - vehiculesLoues;
    const vehiculesEnMaintenance = 0; // À implémenter selon votre logique

    return {
      totalVehicules,
      vehiculesDisponibles,
      vehiculesLoues,
      vehiculesEnMaintenance
    };
  }

  private calculatePopularVehicles(reservations: any[], vehicules: any[]): PopularVehicle[] {
    const vehicleStats: { [key: number]: { count: number, revenue: number } } = {};

    // Compter les réservations par véhicule
    reservations
      .filter(r => r.statut !== 'ANNULEE')
      .forEach(r => {
        const vehiculeId = r.produit.id;
        if (!vehicleStats[vehiculeId]) {
          vehicleStats[vehiculeId] = { count: 0, revenue: 0 };
        }
        vehicleStats[vehiculeId].count++;
        vehicleStats[vehiculeId].revenue += r.prixTotal || 0;
      });

    // Créer la liste des véhicules populaires
    return vehicules
      .map(v => ({
        id: v.id,
        nom: v.nom,
        marque: v.marque,
        nombreReservations: vehicleStats[v.id]?.count || 0,
        revenus: vehicleStats[v.id]?.revenue || 0,
        imageUrl: v.imageUrl
      }))
      .sort((a, b) => b.nombreReservations - a.nombreReservations)
      .slice(0, 5);
  }

  private calculateClientStats(reservations: any[]): ClientStats {
    const clientsUniques = new Set(reservations.map(r => r.email));
    const totalClients = clientsUniques.size;

    // Nouveaux clients ce mois
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const clientsThisMonthl = new Set(
      reservations
        .filter(r => {
          const date = new Date(r.dateCreation);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .map(r => r.email)
    );

    // Clients actifs (qui ont une réservation dans les 30 derniers jours)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const clientsActifs = new Set(
      reservations
        .filter(r => new Date(r.dateCreation) >= thirtyDaysAgo)
        .map(r => r.email)
    );

    return {
      totalClients,
      nouveauxClientsMois: clientsThisMonthl.size,
      clientsActifs: clientsActifs.size
    };
  }
private getRecentReservations(reservations: Reservation[]): RecentReservation[] {
  return reservations.slice(0, 5).map(r => ({
    id: r.id,                     // Ajout de l'id
    clientNom: r.nom,
    clientPrenom: r.prenom,
    vehicule: r.produit.nom,
    dateDepart: new Date(r.dateDepart), // Assurer le type Date
    dateRetour: new Date(r.dateRetour), // Assurer le type Date
    statut: r.statut,             // Ajout du statut
    montant: r.prixTotal
  }));}
private getEmptyDashboardData(): DashboardData {
  return {
    stats: {
      totalReservations: 0,
      reservationsEnCours: 0,
      nouvellesReservations: 0,
      chiffreAffaireMois: 0,
      vehiculesDisponibles: 0,
      tauxOccupation: 0
    },
    reservationStats: { enAttente: 0, confirmees: 0, enCours: 0, terminees: 0, annulees: 0 },
    monthlyRevenue: [],
    vehicleStats: { totalVehicules: 0, vehiculesDisponibles: 0, vehiculesLoues: 0, vehiculesEnMaintenance: 0 },
    popularVehicles: [],
    clientStats: { totalClients: 0, nouveauxClientsMois: 0, clientsActifs: 0 },
    recentReservations: []
  };
}
}

