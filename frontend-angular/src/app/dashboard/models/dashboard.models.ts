// dashboard/models/dashboard.models.ts

export interface DashboardStats {
  totalReservations: number;
  reservationsEnCours: number;
  nouvellesReservations: number;
  chiffreAffaireMois: number;
  vehiculesDisponibles: number;
  tauxOccupation: number;
}

export interface ReservationStats {
  enAttente: number;
  confirmees: number;
  enCours: number;
  terminees: number;
  annulees: number;
}

// Une réservation individuelle
export interface Reservation {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  dateDepart: string;
  dateRetour: string;
  statut: string;
  prixTotal: number;
  produit: {
    id: number;
    nom: string;
    marque: string;
    categorie: string;
    imageUrl?: string;
  };
  dateCreation: string;
}


export interface MonthlyRevenue {
  mois: string;
  revenus: number;
  reservations: number;
}

export interface VehicleStats {
  totalVehicules: number;
  vehiculesDisponibles: number;
  vehiculesLoues: number;
  vehiculesEnMaintenance: number;
}

export interface PopularVehicle {
  id: number;
  nom: string;
  marque: string;
  nombreReservations: number;
  revenus: number;
  imageUrl?: string;
}

export interface ClientStats {
  totalClients: number;
  nouveauxClientsMois: number;
  clientsActifs: number;
}

export interface RecentReservation {
  id: number;
  clientNom: string;
  clientPrenom: string;
  vehicule: string;
  dateDepart: Date;
  dateRetour: Date;
  statut: string;
  montant: number;
}

export interface DashboardData {
  stats: DashboardStats;
  reservationStats: ReservationStats;
  monthlyRevenue: MonthlyRevenue[];
  vehicleStats: VehicleStats;
  popularVehicles: PopularVehicle[];
  clientStats: ClientStats;
  recentReservations: RecentReservation[];
}

// Interfaces pour les graphiques
export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string;
  borderWidth?: number;
  fill?: boolean;
}

export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
}

// Types pour les filtres
export interface DateFilter {
  startDate: Date;
  endDate: Date;
}

export interface DashboardFilters {
  periode: 'jour' | 'semaine' | 'mois' | 'annee';
  dateRange?: DateFilter;
  vehiculeId?: number;
}
