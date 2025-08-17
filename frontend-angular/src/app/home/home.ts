import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatDividerModule } from '@angular/material/divider';
import { Authentication } from '../services/authentication';
import { Product } from '../products/models/product.model';
import { ProductService } from '../products/services/product.service';
import { ProductResponse } from '../products/models/product.model';
import { CarCards } from '../car-cards/car-cards';
import { Boutique } from '../boutique/boutique';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CarCards],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  voituresPopulaires: Product[] = [];
  loadingVoitures: boolean = false;

  // Images du carrousel de voitures de luxe
  heroImages = [
    {
      url: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1920&h=1080&fit=crop&q=80',
      title: 'Lamborghini Aventador',
      subtitle: 'Performance Pure'
    },
    {
      url: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1920&h=1080&fit=crop&q=80',
      title: 'Mercedes-AMG GT',
      subtitle: 'Luxe et Élégance'
    },
    {
      url: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1920&h=1080&fit=crop&q=80',
      title: 'BMW M8',
      subtitle: 'Technologie Avancée'
    },
    {
      url: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=1920&h=1080&fit=crop&q=80',
      title: 'Tesla Model S',
      subtitle: 'Innovation Électrique'
    },
    {
      url: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1920&h=1080&fit=crop&q=80',
      title: 'Audi RS6',
      subtitle: 'Sportivité Raffinée'
    }
  ];

  currentSlide = 0;
  private slideInterval: any;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.chargerVoituresPopulaires();
    this.startSlideShow();
  }

  ngOnDestroy(): void {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
  }

  startSlideShow(): void {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change d'image toutes les 5 secondes
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroImages.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0
      ? this.heroImages.length - 1
      : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  chargerVoituresPopulaires(): void {
    this.loadingVoitures = true;

    // Charger les 6 premières voitures depuis l'API
    this.productService.getProducts(0, 6).subscribe({
      next: (response: ProductResponse) => {
        this.voituresPopulaires = (response.produits || []).slice(0, 6);
        this.loadingVoitures = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des voitures:', error);
        this.loadingVoitures = false;
        // En cas d'erreur, afficher les données de démonstration
        this.voituresPopulaires = [];
      }
    });
  }

  onVoitureRent(voiture: Product): void {
    // Logique de location - à adapter selon vos besoins
    console.log('Voiture sélectionnée pour location:', voiture);
    alert(`Vous avez sélectionné: ${voiture.nom} pour ${voiture.prix}€/jour`);

    // Ici vous pouvez rediriger vers une page de réservation
    // this.router.navigate(['/reservation', voiture.id]);
  }

  voirToutesVoitures(): void {
    // Redirection vers la boutique - à adapter selon votre routing
    console.log('Redirection vers la boutique');
    // this.router.navigate(['/boutique']);
  }

  scrollToVoitures(): void {
    const element = document.querySelector('.voitures-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  allerBoutique(): void {
    this.router.navigate(['/boutique']);
  }
}
