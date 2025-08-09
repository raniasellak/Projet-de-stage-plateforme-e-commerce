import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductService } from '../products/services/product.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-product.html',
  styleUrls: ['./add-product.css']
})
export class AddProduct {
  productForm: FormGroup;
  imagePreview: string | ArrayBuffer | null = null;
  selectedImage?: File;
  @Output() productAdded = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private productService: ProductService) {
    this.productForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(40)]],
      prix: [0, [Validators.required, Validators.min(0)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      couleur: [''],
      annee: [null],
      quantite: [0, [Validators.min(0)]],
      categorie: ['', [Validators.required]],
      marque: ['', [Validators.required]],
      image: [null, Validators.required]
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedImage = input.files[0];
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result;
      reader.readAsDataURL(this.selectedImage);
    }
  }

  onSubmit(): void {
    if (this.productForm.invalid || !this.selectedImage) return;

    const formData = new FormData();

    Object.keys(this.productForm.controls).forEach(key => {
      if (key !== 'image') {
        const value = this.productForm.get(key)?.value;
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });

    formData.append('image', this.selectedImage);

    this.productService.addProductWithImage(formData).subscribe({
      next: () => {
        alert('Produit ajouté avec succès !');
        this.productForm.reset();
        this.imagePreview = null;
        this.selectedImage = undefined;
        this.productAdded.emit();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors de l\'ajout du produit');
      }
    });
  }
}
