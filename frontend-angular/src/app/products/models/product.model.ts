export interface Product {
  id?: number;
  nom?: string;
  description?: string;
  prix?: number;
  quantite?: number;
  couleur?: string;
  annee?: number;
  marque?: string;
  imageUrl?: string;
  categorie?: string;
  imagePublicId?: string | null;

}

// Interface pour la réponse de l'API
export interface ProductResponse {
  produits: Product[];
  totalItems: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}
