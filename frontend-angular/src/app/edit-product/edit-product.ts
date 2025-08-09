import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageUploadService } from '../services/image-upload.service';
import { ProductService } from '../products/services/product.service';
import { Product } from '../products/models/product.model';

@Component({
  selector: 'app-edit-product',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
providers: [ProductService],

  templateUrl: './edit-product.html',
  styleUrls: ['./edit-product.css']
})
export class EditProduct implements OnInit {
  editForm!: FormGroup;
  productId!: number;
  product!: Product;
  isLoading = false;
  isSubmitting = false;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  currentImageUrl: string | null = null;

  // Listes pour les selects
  categories = ['Voiture', 'Moto', 'Accessoire', 'Pièce'];
  couleurs = ['Rouge', 'Bleu', 'Vert', 'Noir', 'Blanc', 'Jaune', 'Orange', 'Violet', 'Rose', 'Gris'];
  marques = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Volkswagen', 'Renault', 'Peugeot'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private imageUploadService: ImageUploadService
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    // Récupérer l'ID du produit depuis l'URL
    this.route.params.subscribe(params => {
      this.productId = +params['id'];
      if (this.productId) {
        this.loadProduct();
      }
    });
  }

  // Initialiser le formulaire vide
  initForm(): void {
    this.editForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prix: ['', [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      couleur: [''],
      annee: ['', [Validators.min(1900), Validators.max(new Date().getFullYear())]],
      quantite: ['', [Validators.required, Validators.min(0)]],
      categorie: ['', Validators.required],
      marque: ['', Validators.required]
    });
  }

  // Charger les données du produit à modifier
  loadProduct(): void {
    this.isLoading = true;

    this.productService.getProductById(this.productId).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.populateForm(product);

        // Définir l'image actuelle
        if (product.imageUrl) {
          this.currentImageUrl =  product.imageUrl;
        }

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.snackBar.open('Erreur lors du chargement du produit', 'Fermer', {
          duration: 3000
        });
        this.isLoading = false;
        this.router.navigate(['/admin/products']);
      }
    });
  }

  // Remplir le formulaire avec les données du produit
  populateForm(product: Product): void {
    this.editForm.patchValue({
      nom: product.nom,
      prix: product.prix,
      description: product.description,
      couleur: product.couleur || '',
      annee: product.annee || '',
      quantite: product.quantite,
      categorie: product.categorie,
      marque: product.marque
    });
  }

  // Gestion de la sélection d'image
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Vérifier le type de fichier
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Veuillez sélectionner un fichier image', 'Fermer', {
          duration: 3000
        });
        return;
      }

      // Vérifier la taille (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.snackBar.open('L\'image ne doit pas dépasser 10MB', 'Fermer', {
          duration: 3000
        });
        return;
      }

      this.selectedFile = file;

      // Créer un aperçu
      const reader = new FileReader();
      reader.onload = (e) => {
        this.imagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  // Supprimer l'image sélectionnée
  removeSelectedImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
    // Reset du input file
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  // Soumettre le formulaire
 onSubmit(): void {
   if (this.editForm.invalid) {
     this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', { duration: 3000 });
     return;
   }

   this.isSubmitting = true;
   // si une nouvelle image est sélectionnée -> envoyer FormData vers /produits-with-image/{id}
   if (this.selectedFile) {
     const formData = new FormData();
     Object.keys(this.editForm.controls).forEach(key => {
       const val = this.editForm.get(key)?.value;
       if (val !== null && val !== undefined) formData.append(key, val.toString());
     });
     formData.append('image', this.selectedFile);

     this.productService.updateProductWithImage(this.productId, formData).subscribe({
       next: () => {
         this.snackBar.open('Produit modifié avec succès!', 'Fermer', { duration: 3000 });
         this.router.navigate(['/admin/products']);
       },
       error: (err) => {
         console.error(err);
         this.snackBar.open('Erreur lors de la modification du produit', 'Fermer', { duration: 3000 });
         this.isSubmitting = false;
       }
     });
   } else {
     // pas de nouvelle image -> envoyer JSON à PUT /api/produits/{id}
     const productData = { ...this.editForm.value };
     this.productService.updateProduct(this.productId, productData).subscribe({
       next: () => {
         this.snackBar.open('Produit modifié avec succès!', 'Fermer', { duration: 3000 });
         this.router.navigate(['/admin/products']);
       },
       error: (err) => {
         console.error(err);
         this.snackBar.open('Erreur lors de la modification du produit', 'Fermer', { duration: 3000 });
         this.isSubmitting = false;
       }
     });
   }
 }



  // Annuler et retourner à la liste
  onCancel(): void {
    this.router.navigate(['/admin/products']);
  }

  // Méthodes utilitaires pour la validation
  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${fieldName} est requis`;
    }
    if (field?.hasError('minlength')) {
      return `${fieldName} est trop court`;
    }
    if (field?.hasError('min')) {
      return `${fieldName} doit être positif`;
    }
    if (field?.hasError('max')) {
      return `${fieldName} doit être valide`;
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

triggerFileInput(): void {
  const fileInput = document.getElementById('fileInput') as HTMLInputElement;
  if (fileInput) {
    fileInput.click();
  }
}

}
