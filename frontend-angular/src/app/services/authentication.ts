import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class Authentication  {
  public username: string | undefined;
  public roles: string[] = [];
  public authenticated: boolean = false;

  // Clé : username (string), valeur : tableau de rôles (string[])
  public users: { [key: string]: string[] } = {
    'admin': ['Client', 'ADMIN'],
    'user1': ['Client']
  };

  constructor(private router: Router) {}

  public login(username: string, password: string): boolean {
    if (this.users[username] && password === '1234') {
      this.username = username;
      this.roles = this.users[username];
       this.authenticated = true;
     this.router.navigate(['/home']);
      return true;
    }
    return false;
  }

  public logout(): void {
    this.authenticated = false;
    this.username = undefined;
    this.roles = [];
    this.router.navigateByUrl('/login');
  }

  public isAuthenticated(): boolean {
    return this.authenticated;
  }
}
