import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../model/clients.model';
import { environment } from '../../environments/environment';
import { Payment } from '../model/clients.model';



@Injectable({
  providedIn: 'root'
})
export class ClientsService {
 private apiUrl = `${environment.apiUrl}/clients`;

   constructor(private http: HttpClient) {}

   getAllClients(): Observable<Client[]> {
     return this.http.get<Client[]>(this.apiUrl);
   }

 getAllPayments(): Observable<Payment[]> {
   return this.http.get<Payment[]>(`${environment.backendHost}/payments`);
 }

 }
