import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { ClientsService } from '../services/clients.service';
import { Client } from '../model/clients.model';
import { MatTableModule } from '@angular/material/table';
import { MatTableDataSource } from '@angular/material/table'; // ✅ Ajouté
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';


@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatDividerModule, MatTableModule],
  templateUrl: './clients.html',
  styleUrls: ['./clients.css']
})
export class Clients implements OnInit {
  clients: Client[] = [];
  clientsDataSource!: MatTableDataSource<Client>; // ✅ Bien typé
  displayedColumns: string[] = ['image', 'id', 'nom', 'prenom', 'email', 'cni', 'telephone']; // ✅ orthographe corrigée

  constructor(private clientsService: ClientsService,private router : Router) {}

  ngOnInit(): void {
    this.clientsService.getAllClients().subscribe({
      next: (data: Client[]) => {
        this.clients = data;
        this.clientsDataSource = new MatTableDataSource<Client>(data); // ✅ OK
      },
      error: (err: any) => {
        console.error('Erreur lors de la récupération des clients :', err);
      }
    });
  }

  getImageUrl(fileName: string): string {
    return `${environment.imagePath}/${fileName}`;
  }

clientPayments(client : Client){
  this.router.navigateByUrl(`/admin/client-details/${client.cni}`);
  }
}
