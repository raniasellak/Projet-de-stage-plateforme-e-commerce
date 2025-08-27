export interface DashboardStats {
  totalVehicles: number;
  availableVehicles: number;
  rentedVehicles: number;
  maintenanceVehicles: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeReservations: number;
  newCustomers: number;
}

export interface ReservationSummary {
  id: number;
  customerName: string;
  vehicleModel: string;
  startDate: string;
  endDate: string;
  status: string;
  totalAmount: number;
}

export interface VehicleAlert {
  id: number;
  vehicleId: number;
  vehicleModel: string;
  type: string;
  message: string;
  priority: string;
  createdAt: string;
}
