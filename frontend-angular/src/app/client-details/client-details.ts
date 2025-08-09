import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [],
  templateUrl: './client-details.html',
  styleUrl: './client-details.css'
})
export class ClientDetails implements OnInit {
  clientCode : string='';
  constructor(private router: ActivatedRoute){
    }
  ngOnInit(): void {
     // Récupérer le paramètre de route
     this.clientCode = this.router.snapshot.params['clientCode'] || '';
}
}
