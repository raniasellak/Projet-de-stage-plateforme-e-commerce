import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { ViewChild, AfterViewInit } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { ClientsService } from '../services/clients.service';
import { Payment } from '../model/clients.model'; // ✅ Import Payment aussi

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule,
    MatTableModule,
    HttpClientModule,
    MatSortModule,
    MatPaginatorModule,
  ],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class Payments implements OnInit {
  public payments: Payment[] = []; // ✅ Typé correctement
  public dataSource: MatTableDataSource<Payment> = new MatTableDataSource(); // ✅ Typé
  public displayedColumns: string[] = ['id', 'datePaiement', 'montant', 'prenom', 'nom', 'status', 'typePaiement'];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private clientsService: ClientsService) {}

  ngOnInit() {
    this.clientsService.getAllPayments().subscribe({
      next: response => {
        // Ici, response est directement un tableau de paiements
        this.payments = response;

        // On affecte les données au tableau Angular Material
        this.dataSource.data = this.payments;

        console.log('Payments chargés:', this.payments); // Pour vérifier
      },
      error: err => {
        // Si une erreur se produit (erreur 404, 500, etc.)
        console.error("Erreur lors de la récupération des paiements :", err);
      }
    });
  }



  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }
}
