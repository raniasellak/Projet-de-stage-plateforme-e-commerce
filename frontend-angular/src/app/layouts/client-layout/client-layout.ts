import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavbarClient } from '../../shared/navbar-client/navbar-client';
import { FooterClient } from '../../shared/footer-client/footer-client';

@Component({
  selector: 'app-client-layout',
  standalone: true,
  imports: [RouterModule, NavbarClient, FooterClient],
  templateUrl: './client-layout.html',
  styleUrls: ['./client-layout.css']
})
export class ClientLayout {

}
