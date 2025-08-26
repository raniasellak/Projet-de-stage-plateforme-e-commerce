import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationsService, Reservation } from 'src/app/reservations/services/reservations.service';


@Component({
  selector: 'app-reservations',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reservations.html',
  styleUrl: './reservations.css'
})
export class Reservations implements OnInit {
                            reservations: Reservation[] = [];
                            totalItems = 0;
                            currentPage = 0;
                            pageSize = 10;
                            totalPages = 0;

                            constructor(public reservationsService: ReservationsService) {}

                            ngOnInit(): void {
                              this.loadReservations();
                            }

                            loadReservations(page: number = 0): void {
                              this.reservationsService.getAllReservations(page, this.pageSize).subscribe({
                                next: (data:any) => {
                                  this.reservations = data.reservations;
                                  this.totalItems = data.totalItems;
                                  this.currentPage = data.currentPage;
                                  this.totalPages = data.totalPages;
                                },
                                error: (err:any) => console.error('Erreur chargement réservations', err)
                              });
                            }

                            supprimer(id: number) {
                              if (confirm('Voulez-vous vraiment supprimer cette réservation ?')) {
                                this.reservationsService.deleteReservation(id).subscribe(() => {
                                  this.loadReservations(this.currentPage);
                                });
                              }
                            }

                            changerStatut(id: number, statut: string) {
                              this.reservationsService.updateStatus(id, statut).subscribe(() => {
                                this.loadReservations(this.currentPage);
                              });
                            }

                            goToPage(page: number) {
                              if (page >= 0 && page < this.totalPages) {
                                this.loadReservations(page);
                              }
                            }
                          }
