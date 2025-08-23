import { Component, Input, Output, EventEmitter, OnInit, inject  } from '@angular/core';
import { Product } from '../products/models/product.model';
import { CommonModule } from '@angular/common';
import { CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-car-cards',
   standalone: true,
    imports: [CommonModule, CurrencyPipe],
  templateUrl: './car-cards.html',
  styleUrls: ['./car-cards.css']
})
export class CarCards implements OnInit {
  private router = inject(Router);
  @Input() voitures: Product[] = [];
  @Input() loading: boolean = false;
  @Output() onRentClick = new EventEmitter<Product>();

  // Données de démonstration pour tester le composant
  voituresDemo: Product[] = [
    {
      id: 1,
      nom: "BMW Série 3",
      prix: 85.00,
      description: "Berline de luxe avec un design élégant et des performances exceptionnelles",
      couleur: "Noir",
      annee: 2023,
      quantite: 3,
      categorie: "Berline",
      marque: "BMW",
      imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop",
      imagePublicId: null
    },
    {
      id: 2,
      nom: "Mercedes C-Class",
      prix: 95.00,
      description: "Confort premium et technologie avancée pour vos déplacements",
      couleur: "Blanc",
      annee: 2023,
      quantite: 2,
      categorie: "Berline",
      marque: "Mercedes",
      imageUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400&h=300&fit=crop",
      imagePublicId: null
    },
    {
      id: 3,
      nom: "Audi Q5",
      prix: 110.00,
      description: "SUV spacieux idéal pour les voyages en famille et les aventures",
      couleur: "Gris",
      annee: 2024,
      quantite: 4,
      categorie: "SUV",
      marque: "Audi",
      imageUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop",
      imagePublicId: null
    },
    {
      id: 4,
      nom: "Tesla Model S",
      prix: 125.00,
      description: "Voiture électrique de luxe avec une autonomie exceptionnelle",
      couleur: "Rouge",
      annee: 2024,
      quantite: 1,
      categorie: "Électrique",
      marque: "Tesla",
      imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=400&h=300&fit=crop",
      imagePublicId: null
    },
    {
      id: 5,
      nom: "Toyota Camry",
      prix: 65.00,
      description: "Berline fiable et économique pour vos déplacements quotidiens",
      couleur: "Bleu",
      annee: 2023,
      quantite: 5,
      categorie: "Berline",
      marque: "Toyota",
      imageUrl: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400&h=300&fit=crop",
      imagePublicId: null
    },
    {
      id: 6,
      nom: "Range Rover Sport",
      prix: 150.00,
      description: "SUV de luxe tout-terrain avec un design sophistiqué",
      couleur: "Noir",
      annee: 2024,
      quantite: 2,
      categorie: "SUV",
      marque: "Range Rover",
      imageUrl: "https://images.unsplash.com/photo-1494905998402-395d579af36f?w=400&h=300&fit=crop",
      imagePublicId: null
    }
  ];

  ngOnInit(): void {
    // Si aucune voiture n'est fournie, utiliser les données de démonstration
    if (this.voitures.length === 0) {
      this.voitures = this.voituresDemo;
    }
  }

  onRentCar(voiture: Product): void {
      // Vérifier que la voiture est disponible
      if (!voiture.quantite || voiture.quantite === 0) {
        console.log(`La voiture ${voiture.nom} n'est pas disponible`);
        return;
      }

      // Émettre l'événement vers le composant parent (si nécessaire)
      this.onRentClick.emit(voiture);

      // Naviguer vers la page de réservation avec l'ID de la voiture
      this.router.navigate(['/reservation', voiture.id]);

      console.log(`Navigation vers la réservation de: ${voiture.nom} (ID: ${voiture.id})`);
    }

    getBadgeColor(categorie: string | undefined): string {
      if (!categorie) return '#033c4f';

      switch (categorie.toLowerCase()) {
        case 'berline':
          return '#033c4f';
        case 'suv':
          return '#1976d2';
        case 'électrique':
          return '#4caf50';
        case 'sport':
          return '#f44336';
        default:
          return '#033c4f';
      }
    }

  getAvailabilityStatus(quantite: number | undefined): {text: string, class: string} {
    if (!quantite || quantite === 0) return { text: 'Indisponible', class: 'unavailable' };
    if (quantite <= 2) return { text: 'Derniers exemplaires', class: 'limited' };
    return { text: 'Disponible', class: 'available' };
  }

  onImageError(event: any): void {
    event.target.src = 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400&h=300&fit=crop';
  }

  trackByFn(index: number, item: Product): any {
    return item.id;
  }
}
