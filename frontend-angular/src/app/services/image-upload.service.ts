import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private uploadUrl = 'http://localhost:8085/api/upload'; // CORRECTION: Enlever "products"

  constructor(private http: HttpClient) {}

  uploadImage(file: File): Observable<{secure_url: string, public_id: string}> {
    const formData = new FormData();
    formData.append('image', file);

    // Retourner l'objet complet avec secure_url et public_id
    return this.http.post<{secure_url: string, public_id: string}>(this.uploadUrl, formData);
  }
}
