import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-load-payments',
   standalone: true,
    imports: [CommonModule,MatCardModule, MatDividerModule],
  templateUrl: './load-payments.html',
  styleUrl: './load-payments.css'
})
export class LoadPayments {

}
