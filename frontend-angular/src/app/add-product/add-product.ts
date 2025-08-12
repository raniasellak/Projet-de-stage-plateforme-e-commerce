import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProductService } from '../products/services/product.service';

@Component({
  selector: 'app-add-product',
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
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.css']
})
export class AddProduct {
  productForm: FormGroup;
  imagePreview: string | null = null;
  selectedImage?: File;
  isSubmitting = false;

  @Output() productAdded = new EventEmitter<void>();

  // Listes pour les selects
  categories = ['Voiture', 'Moto', 'Accessoire', 'Pièce'];
  couleurs = ['Rouge', 'Bleu', 'Vert', 'Noir', 'Blanc', 'Jaune', 'Orange', 'Violet', 'Rose', 'Gris'];
  marques = ['Toyota', 'Honda', 'BMW', 'Mercedes', 'Audi', 'Ford', 'Volkswagen', 'Renault', 'Peugeot'];

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(40)]],
      prix: [0, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      couleur: [''],
      annee: [null, [Validators.min(1900), Validators.max(new Date().getFullYear())]],
      quantite: [0, [Validators.required, Validators.min(0)]],
      categorie: ['', [Validators.required]],
      marque: ['', [Validators.required]],
      image: [null, Validators.required]
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

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

      this.selectedImage = file;
      this.productForm.patchValue({ image: file });

      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(this.selectedImage);
    }
  }

onSubmit(): void {
  console.log('Formulaire soumis');
  console.log('Form valid:', this.productForm.valid);
  console.log('Selected image:', this.selectedImage);
  console.log('Form errors:', this.getFormErrors());
  console.log('Form value:', this.productForm.value);

  if (this.productForm.invalid) {
    this.snackBar.open('Veuillez corriger les erreurs dans le formulaire', 'Fermer', {
      duration: 3000
    });
    this.markAllFieldsAsTouched();
    return;
  }

  if (!this.selectedImage) {
    this.snackBar.open('Veuillez sélectionner une image', 'Fermer', {
      duration: 3000
    });
    return;
  }

  this.isSubmitting = true;

  const formData = new FormData();

  // Ajouter tous les champs du formulaire avec une meilleure gestion des valeurs nulles
  const formValue = this.productForm.value;

  // Champs obligatoires
  formData.append('nom', formValue.nom || '');
  formData.append('prix', (formValue.prix || 0).toString());
  formData.append('description', formValue.description || '');
  formData.append('quantite', (formValue.quantite || 0).toString());
  formData.append('categorie', formValue.categorie || '');
  formData.append('marque', formValue.marque || '');

  // Champs optionnels - ne pas envoyer si vide
  if (formValue.couleur && formValue.couleur.trim() !== '') {
    formData.append('couleur', formValue.couleur.trim());
  }

  if (formValue.annee && formValue.annee > 0) {
    formData.append('annee', formValue.annee.toString());
  }

  // Ajouter l'image
  formData.append('image', this.selectedImage);

  // Debug : afficher le contenu du FormData
  console.log('=== Contenu du FormData ===');
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }

  console.log('Envoi des données...');

  this.productService.addProductWithImage(formData).subscribe({
    next: (response) => {
      console.log('Produit ajouté avec succès:', response);
      this.snackBar.open('Produit ajouté avec succès !', 'Fermer', {
        duration: 3000,
        panelClass: ['success-snackbar']
      });
      this.resetForm();
      this.productAdded.emit();
      this.isSubmitting = false;
    },
    error: (error) => {
      console.error('Erreur lors de l\'ajout:', error);
      this.snackBar.open(
        error.message || 'Erreur lors de l\'ajout du produit',
        'Fermer',
        { duration: 5000, panelClass: ['error-snackbar'] }
      );
      this.isSubmitting = false;
    }
  });
}



  resetForm(): void {
    this.productForm.reset();
    this.imagePreview = null;
    this.selectedImage = undefined;

    // Reset des valeurs par défaut
    this.productForm.patchValue({
      prix: 0,
      quantite: 0
    });
  }

  markAllFieldsAsTouched(): void {
    Object.keys(this.productForm.controls).forEach(key => {
      this.productForm.get(key)?.markAsTouched();
    });
  }

  getFormErrors(): any {
    let formErrors: any = {};
    Object.keys(this.productForm.controls).forEach(key => {
      const controlErrors = this.productForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  // Méthodes pour les messages d'erreur
  getErrorMessage(fieldName: string): string {
    const field = this.productForm.get(fieldName);
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

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      'nom': 'Le nom',
      'prix': 'Le prix',
      'description': 'La description',
      'couleur': 'La couleur',
      'annee': 'L\'année',
      'quantite': 'La quantité',
      'categorie': 'La catégorie',
      'marque': 'La marque',
      'image': 'L\'image'
    };
    return labels[fieldName] || fieldName;
  }
}
