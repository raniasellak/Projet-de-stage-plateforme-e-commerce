import { Injectable, Inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Authentication } from '../services/authentication'; // ✅ Bien importé

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    @Inject(Authentication) private authService: Authentication,
    private router: Router
  ) {}

  canActivate(): boolean {
    if (this.authService.authenticated === true) {
      return true;
    } else {
      this.router.navigateByUrl('/login');
      return false;
    }
  }
}
