import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-load-clients',
  standalone: true,
  templateUrl: './load-clients.html',
  imports: [
    CommonModule,
    MatCardModule,
    MatDividerModule
  ]
})
export class LoadClients {}
