
import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Authentication } from '../services/authentication'; // ou AuthenticationService si c'est bien son nom

@Injectable({
  providedIn: 'root'
})
export class AuthorizationGuard implements CanActivate {
  constructor(private authService: Authentication, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let authorize = false;
    let authorizeRoles: string[] = route.data['roles'];
    let roles: string[] = this.authService.roles;

    for (let i = 0; i < roles.length; i++) {
      if (authorizeRoles.includes(roles[i])) {
        authorize = true;
      }
    }

    if (!authorize) this.router.navigate(['/login']);
    return authorize;
  }
}
