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
          this.currentImageUrl = product.imageUrl;
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

  // Méthode de soumission du formulaire
  onSubmit(): void {
    if (this.editForm.invalid) {
      this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
        duration: 3000
      });
      return;
    }

    this.isSubmitting = true;

if (this.selectedFile) {
  const formData = new FormData();

  // Ajouter tous les champs du formulaire au FormData
  Object.keys(this.editForm.controls).forEach(key => {
    const value = this.editForm.get(key)?.value;
    if (value !== null && value !== undefined && value !== '') {
      formData.append(key, value.toString());
    }
  });

  // Ajouter l'image au FormData
  formData.append('image', this.selectedFile);

  // Appel à updateProductWithImage
  this.productService.updateProductWithImage(this.productId, formData).subscribe({
    next: (response: Product) => {
      console.log("Produit mis à jour avec succès :", response);
      this.snackBar.open('Produit modifié avec succès!', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.router.navigate(['/admin/products']);
    },
    error: (error: any) => {
      console.error("Erreur lors de la mise à jour :", error);
      this.snackBar.open(
        error.error?.message || 'Erreur lors de la modification du produit',
        'Fermer',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
      this.isSubmitting = false;
    }
  });
}

    // Pas de nouvelle image - modification des données seulement
    else {
      const productData = { ...this.editForm.value };

      // Nettoyer les valeurs vides/null pour éviter les erreurs
      Object.keys(productData).forEach(key => {
           if (productData[key] === '' || productData[key] === null) {
             // Pour les champs optionnels, on peut les laisser undefined
             if (key === 'couleur' || key === 'annee') {
               productData[key] = null;
             } else {
               delete productData[key];
             }
           }
         });

      // Appel à updateProduct
      this.productService.updateProduct(this.productId, productData).subscribe({
        next: (response) => {
          console.log('Produit mis à jour sans changement d\'image:', response);
          this.snackBar.open('Produit modifié avec succès!', 'Fermer', {
            duration: 3000,
            panelClass: ['success-snackbar']
          });
          this.router.navigate(['/admin/products']);
        },
        error: (error: any) => {
          console.error('Erreur lors de la modification sans image:', error);
          this.snackBar.open(
            error.error?.message || 'Erreur lors de la modification du produit',
            'Fermer',
            { duration: 5000, panelClass: ['error-snackbar'] }
          );
          this.isSubmitting = false;
        }
      });
    }
  }

  // Méthode pour obtenir les messages d'erreur personnalisés
  getErrorMessage(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} est requis`;
    }
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} doit contenir au moins ${minLength} caractères`;
    }
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} ne doit pas dépasser ${maxLength} caractères`;
    }
    if (field?.hasError('min')) {
      const minValue = field.errors?.['min']?.min;
      return `${this.getFieldLabel(fieldName)} doit être supérieur ou égal à ${minValue}`;
    }
    if (field?.hasError('max')) {
      const maxValue = field.errors?.['max']?.max;
      return `${this.getFieldLabel(fieldName)} doit être inférieur ou égal à ${maxValue}`;
    }
    return '';
  }

  // Méthode pour vérifier si un champ est invalide
  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  // Méthode privée pour obtenir le label français d'un champ
  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'nom': 'Le nom',
      'prix': 'Le prix',
      'description': 'La description',
      'couleur': 'La couleur',
      'annee': 'L\'année',
      'quantite': 'La quantité',
      'categorie': 'La catégorie',
      'marque': 'La marque'
    };
    return labels[fieldName] || fieldName;
  }

  // Méthode pour déclencher l'ouverture du sélecteur de fichiers
  triggerFileInput(): void {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  // Méthode pour annuler et retourner à la liste des produits
  onCancel(): void {
    this.router.navigate(['/admin/products']);
  }
}
