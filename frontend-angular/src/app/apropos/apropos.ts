import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Importation des composants partagés
import { NavbarClient } from '../shared/navbar-client/navbar-client';
import { FooterClient } from '../shared/footer-client/footer-client';

// Interface pour définir la structure d'un membre de l'équipe
export interface TeamMember {
  id: number;
  name: string;
  position: string;
  description: string;
  image: string;
  socialLinks: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
  };
}

// Interface pour les statistiques de l'entreprise
export interface CompanyStats {
  vehicles: string;
  clients: string;
  cities: string;
  rating: string;
}

// Interface pour les valeurs de l'entreprise
export interface CompanyValue {
  id: number;
  title: string;
  description: string;
  icon: string;
}

// Interface pour les services
export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-apropos',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NavbarClient,
    FooterClient
  ],
  templateUrl: './apropos.html',
  styleUrls: ['./apropos.css']
})
export class Apropos implements OnInit {

  // Données de l'équipe
  teamMembers: TeamMember[] = [
    {
      id: 1,
      name: 'Ahmed Benali',
      position: 'Directeur Général',
      description: 'Plus de 15 ans d\'expérience dans l\'industrie automobile. Ahmed dirige notre vision stratégique et notre expansion nationale.',
      image: '/assets/team/directeur.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/ahmed-benali',
        twitter: 'https://twitter.com/ahmed_benali'
      }
    },
    {
      id: 2,
      name: 'Fatima Alaoui',
      position: 'Responsable Opérations',
      description: 'Experte en gestion de flotte, Fatima assure la qualité et la disponibilité de nos véhicules à travers tout le Maroc.',
      image: '/assets/team/responsable-operations.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/fatima-alaoui',
        twitter: 'https://twitter.com/fatima_alaoui'
      }
    },
    {
      id: 3,
      name: 'Youssef Rami',
      position: 'Chef Service Client',
      description: 'Passionné par l\'excellence du service, Youssef veille à ce que chaque client vive une expérience exceptionnelle.',
      image: '/assets/team/chef-service-client.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/youssef-rami',
        twitter: 'https://twitter.com/youssef_rami'
      }
    },
    {
      id: 4,
      name: 'Omar Khadiri',
      position: 'Responsable Technique',
      description: 'Mécanicien certifié avec 12 ans d\'expérience, Omar supervise la maintenance et la sécurité de notre flotte.',
      image: '/assets/team/responsable-technique.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/omar-khadiri',
        twitter: 'https://twitter.com/omar_khadiri'
      }
    },
    {
      id: 5,
      name: 'Layla Mansouri',
      position: 'Responsable Commercial',
      description: 'Spécialiste en négociation et relations clients, Layla développe nos partenariats et offres personnalisées.',
      image: '/assets/team/responsable-commercial.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/layla-mansouri',
        twitter: 'https://twitter.com/layla_mansouri'
      }
    },
    {
      id: 6,
      name: 'Karim Bennani',
      position: 'Responsable IT',
      description: 'Développeur full-stack et expert en systèmes, Karim assure l\'innovation technologique de notre plateforme.',
      image: '/assets/team/responsable-it.jpg',
      socialLinks: {
        linkedin: 'https://linkedin.com/in/karim-bennani',
        twitter: 'https://twitter.com/karim_bennani'
      }
    }
  ];

  // Statistiques de l'entreprise
  companyStats: CompanyStats = {
    vehicles: '500+',
    clients: '10k+',
    cities: '15',
    rating: '4.8/5'
  };

  // Valeurs de l'entreprise
  companyValues: CompanyValue[] = [
    {
      id: 1,
      title: 'Sécurité',
      description: 'Tous nos véhicules sont régulièrement entretenus et contrôlés pour garantir votre sécurité sur la route.',
      icon: 'fa-shield'
    },
    {
      id: 2,
      title: 'Excellence',
      description: 'Nous nous engageons à fournir un service de qualité supérieure qui dépasse vos attentes.',
      icon: 'fa-star'
    },
    {
      id: 3,
      title: 'Confiance',
      description: 'La transparence et l\'honnêteté sont au cœur de notre relation avec chaque client.',
      icon: 'fa-heart'
    },
    {
      id: 4,
      title: 'Service Client',
      description: 'Notre équipe est disponible 24h/24 et 7j/7 pour vous accompagner à chaque étape.',
      icon: 'fa-users'
    }
  ];

  // Services offerts
  services: Service[] = [
    {
      id: 1,
      title: 'Location Courte Durée',
      description: 'De quelques heures à plusieurs jours, louez le véhicule parfait pour vos besoins ponctuels.',
      icon: 'fa-car'
    },
    {
      id: 2,
      title: 'Location Longue Durée',
      description: 'Solutions flexibles pour les entreprises et particuliers ayant des besoins à long terme.',
      icon: 'fa-calendar'
    },
    {
      id: 3,
      title: 'Véhicules de Luxe',
      description: 'Collection exclusive de voitures haut de gamme pour vos occasions spéciales.',
      icon: 'fa-diamond'
    },
    {
      id: 4,
      title: 'Livraison Gratuite',
      description: 'Nous livrons votre véhicule partout au Maroc, directement à votre emplacement.',
      icon: 'fa-map-o'
    },
    {
      id: 5,
      title: 'Support 24/7',
      description: 'Assistance technique et administrative disponible à tout moment.',
      icon: 'fa-headphones'
    },
    {
      id: 6,
      title: 'Assurance Complète',
      description: 'Protection maximale incluse dans tous nos contrats de location.',
      icon: 'fa-shield'
    }
  ];

  constructor() { }

  ngOnInit(): void {
    // Initialisation du composant
    this.loadPageData();

    // Scroll vers le haut de la page
    window.scrollTo(0, 0);
  }

  /**
   * Charge les données de la page
   * Cette méthode peut être étendue pour charger des données depuis une API
   */
  private loadPageData(): void {
    // Ici, vous pouvez ajouter la logique pour charger des données
    // depuis votre backend API si nécessaire
    console.log('Données de la page À propos chargées');
  }

  /**
   * Gère le clic sur les liens sociaux
   * @param url - L'URL du réseau social
   * @param platform - La plateforme sociale (linkedin, twitter, etc.)
   */
  onSocialLinkClick(url: string, platform: string): void {
    if (url) {
      // Ouvrir le lien dans un nouvel onglet
      window.open(url, '_blank', 'noopener,noreferrer');

      // Log pour le suivi analytique (optionnel)
      console.log(`Clic sur ${platform}: ${url}`);
    }
  }

  /**
   * Gère la navigation vers les autres pages
   * @param route - La route vers laquelle naviguer
   */
  navigateToPage(route: string): void {
    // Cette méthode peut être utilisée pour ajouter une logique
    // supplémentaire avant la navigation (analytics, etc.)
    console.log(`Navigation vers: ${route}`);
  }

  /**
   * Gère les erreurs de chargement d'images
   * @param event - L'événement d'erreur
   * @param memberName - Le nom du membre de l'équipe
   */
  onImageError(event: any, memberName: string): void {
    // Image de remplacement en cas d'erreur
    event.target.src = '/assets/team/default-avatar.jpg';
    console.warn(`Impossible de charger l'image pour ${memberName}`);
  }

  /**
   * Retourne la classe CSS pour l'icône FontAwesome
   * @param iconName - Le nom de l'icône
   */
  getIconClass(iconName: string): string {
    return `fa ${iconName}`;
  }

  /**
   * Formate les statistiques pour l'affichage
   * @param stat - La statistique à formater
   */
  formatStat(stat: string): string {
    return stat;
  }

  /**
   * Vérifie si un membre de l'équipe a des liens sociaux
   * @param member - Le membre de l'équipe
   */
  hasSocialLinks(member: TeamMember): boolean {
    const links = member.socialLinks;
    return !!(links.linkedin || links.twitter || links.facebook);
  }

  /**
   * Animation au scroll (optionnel)
   * Peut être utilisé avec Intersection Observer pour des animations
   */
  private initScrollAnimations(): void {
    // Logique d'animation au scroll
    // Peut être implémentée si vous voulez des animations
    // quand les sections entrent dans le viewport
  }
}
