
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-load-products',
 standalone: true,
     imports: [CommonModule,MatCardModule, MatDividerModule],
  templateUrl: './load-products.html',
  styleUrl: './load-products.css'
})
export class LoadProducts {

}
