import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService {
  private uploadUrl = 'http://localhost:8085/api/products/upload';

  constructor(private http: HttpClient) {}

    uploadImage(file: File): Observable<string> {
      const formData = new FormData();
      formData.append('image', file);

      return this.http.post(this.uploadUrl, formData, { responseType: 'text' });
    }

}
