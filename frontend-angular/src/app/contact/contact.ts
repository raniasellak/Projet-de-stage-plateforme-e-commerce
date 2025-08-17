import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,         // Pour *ngIf et *ngFor
    ReactiveFormsModule,  // Pour formGroup et les formulaires réactifs
    FormsModule           // Si tu utilises ngModel
  ],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(100%)' }),
        animate('300ms ease-in', style({ opacity: 1, transform: 'translateX(0%)' }))
      ]),
      transition(':leave', [
        animate('300ms ease-out', style({ opacity: 0, transform: 'translateX(100%)' }))
      ])
    ])
  ]
})
export class Contact implements OnInit {

  contactForm: FormGroup;
  selectedFiles: File[] = [];
  isDragOver = false;
  isLoading = false;
  showSuccessMessage = false;
  showErrorMessage = false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient
  ) {
    this.contactForm = this.createForm();
  }

  ngOnInit(): void {
    // Initialisation du composant
  }

  /**
   * Création du formulaire réactif avec validations
   */
  private createForm(): FormGroup {
    return this.formBuilder.group({
      requestType: ['', [Validators.required]],
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      subject: ['', [Validators.required, Validators.minLength(3)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  /**
   * Vérification si un champ est invalide et touché
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.contactForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  /**
   * Gestion de la sélection de fichiers via input
   */
  onFilesSelected(event: any): void {
    const files = event.target.files;
    this.processFiles(files);
  }

  /**
   * Gestion du drag over
   */
  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  /**
   * Gestion du drag leave
   */
  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  /**
   * Gestion du drop de fichiers
   */
  onFilesDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  /**
   * Traitement des fichiers sélectionnés
   */
  private processFiles(fileList: FileList): void {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];

      // Vérification du type de fichier
      if (!allowedTypes.includes(file.type)) {
        this.showErrorToast(`Le fichier ${file.name} n'est pas d'un type autorisé.`);
        continue;
      }

      // Vérification de la taille
      if (file.size > maxFileSize) {
        this.showErrorToast(`Le fichier ${file.name} est trop volumineux (max 10MB).`);
        continue;
      }

      // Vérification si le fichier n'est pas déjà sélectionné
      if (!this.selectedFiles.some(f => f.name === file.name && f.size === file.size)) {
        this.selectedFiles.push(file);
      }
    }
  }

  /**
   * Suppression d'un fichier de la liste
   */
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1);
  }

  /**
   * Obtention de l'icône correspondant au type de fichier
   */
  getFileIcon(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return 'fa-file-pdf';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'fa-file-image';
      default:
        return 'fa-file';
    }
  }

  /**
   * Formatage de la taille du fichier
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Réinitialisation du formulaire
   */
  resetForm(): void {
    this.contactForm.reset();
    this.selectedFiles = [];
  }

  /**
   * Soumission du formulaire
   */
  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isLoading = true;

      const formData = new FormData();

      // Ajout des données du formulaire
      Object.keys(this.contactForm.value).forEach(key => {
        const value = this.contactForm.value[key];
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });

      // Ajout des fichiers
      this.selectedFiles.forEach((file) => {
        formData.append('files', file);
      });

      // Ajout d'informations supplémentaires
      formData.append('timestamp', new Date().toISOString());
      formData.append('userAgent', navigator.userAgent);

      // Envoi de l'email via l'API Spring Boot - URL CORRIGÉE
      this.sendContactForm(formData);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      this.markFormGroupTouched();
    }
  }

  /**
   * Marquer tous les champs du formulaire comme touchés
   */
  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  /**
   * Envoi du formulaire de contact via l'API
   */
  private sendContactForm(formData: FormData): void {
    // ✅ URL CORRIGÉE : ajout de "/api" avant "/contact"
    this.http.post(`${environment.backendHost}/api/contact/send-email`, formData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        console.log('Réponse du serveur:', response);
        this.showSuccessToast('Votre message a été envoyé avec succès!');
        this.resetForm();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur lors de l\'envoi:', error);

        // Messages d'erreur plus détaillés
        let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';

        if (error.status === 0) {
          errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
        } else if (error.status === 404) {
          errorMessage = 'Service non trouvé. Vérifiez l\'URL de l\'API.';
        } else if (error.status === 500) {
          errorMessage = 'Erreur serveur. Contactez l\'administrateur.';
        }

        this.showErrorToast(errorMessage);
      }
    });
  }

  /**
   * Affichage d'un message de succès
   */
  private showSuccessToast(message: string): void {
    this.showSuccessMessage = true;
    setTimeout(() => {
      this.showSuccessMessage = false;
    }, 4000);
  }

  /**
   * Affichage d'un message d'erreur
   */
  private showErrorToast(message: string): void {
    this.showErrorMessage = true;
    setTimeout(() => {
      this.showErrorMessage = false;
    }, 4000);
  }

  /**
   * Obtention du message d'erreur personnalisé
   */
  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);

    if (field?.hasError('required')) {
      switch (fieldName) {
        case 'requestType': return 'Veuillez sélectionner le type de votre demande';
        case 'firstName': return 'Le prénom est requis';
        case 'lastName': return 'Le nom est requis';
        case 'email': return 'L\'email est requis';
        case 'subject': return 'Le sujet est requis';
        case 'message': return 'Le message est requis';
        default: return 'Ce champ est requis';
      }
    }

    if (field?.hasError('email')) {
      return 'Veuillez saisir un email valide';
    }

    if (field?.hasError('minlength')) {
      const requiredLength = field.errors?.['minlength']?.requiredLength;
      switch (fieldName) {
        case 'firstName':
        case 'lastName':
          return `Le ${fieldName === 'firstName' ? 'prénom' : 'nom'} doit contenir au moins ${requiredLength} caractères`;
        case 'subject':
          return `Le sujet doit contenir au moins ${requiredLength} caractères`;
        case 'message':
          return `Le message doit contenir au moins ${requiredLength} caractères`;
        default:
          return `Ce champ doit contenir au moins ${requiredLength} caractères`;
      }
    }

    return '';
  }

  /**
   * Validation personnalisée pour le téléphone (optionnel)
   */
  private phoneValidator(control: any) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (control.value && !phoneRegex.test(control.value)) {
      return { invalidPhone: true };
    }
    return null;
  }
}
