// src/app/services/reservation.ts
// Modèle cohérent avec ton backend (entities/Reservation.java)
export interface Reservation {
  id?: number;

  // Tu peux choisir l'un des deux suivants :
  // 1) Si ton backend attend un objet Produit complet dans le JSON :
  // produit?: { id: number; nom?: string; prix?: number }; // minimal si tu veux
  // 2) Si ton backend attend seulement l'ID (plus simple côté front) :
  produitId: number;

  dateDepart: string;   // LocalDate -> string (format "YYYY-MM-DD")
  dateRetour: string;   // LocalDate -> string
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  lieuPrise: string;
  lieuRetour: string;

  prixTotal?: number;    // optionnel si calculé côté backend
  nombreJours?: number;  // optionnel si calculé côté backend

  // Enum côté Java -> chaîne côté TS
  statut?: 'EN_ATTENTE' | 'CONFIRMEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';

  dateCreation?: string;      // LocalDateTime -> string ISO
  dateModification?: string;  // LocalDateTime -> string ISO
}
