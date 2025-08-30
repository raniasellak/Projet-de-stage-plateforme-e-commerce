import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Authentication } from '../services/authentication';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  @ViewChild('container', { static: true }) container!: ElementRef;

  public loginFormGroup!: FormGroup;
  public registerFormGroup!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: Authentication,
    private router: Router
  ) {}

  ngOnInit() {
    this.loginFormGroup = this.fb.group({
      username: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    });

    this.registerFormGroup = this.fb.group({
      name: this.fb.control('', [Validators.required]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      password: this.fb.control('', [Validators.required, Validators.minLength(6)])
    });
  }

  // Méthode pour basculer vers le panneau d'inscription
  showSignUp() {
    this.container.nativeElement.classList.add("right-panel-active");
  }

  // Méthode pour basculer vers le panneau de connexion
  showSignIn() {
    this.container.nativeElement.classList.remove("right-panel-active");
  }

  // Votre logique de connexion existante
  login() {
    if (this.loginFormGroup.valid) {
      let username = this.loginFormGroup.value.username;
      let password = this.loginFormGroup.value.password;

      let auth = this.authService.login(username, password);

      if (auth === true) {
        const roles = this.authService.roles;

        if (roles.includes('ADMIN')) {
          this.router.navigateByUrl('/admin/dashboard');
        } else if (roles.includes('Client')) {
          this.router.navigateByUrl('/home');
        } else {
          this.router.navigateByUrl('/');
        }
      } else {
        alert('Identifiants incorrects');
      }
    }
  }

  // Méthode pour l'inscription (frontend seulement pour l'instant)
  register() {
    if (this.registerFormGroup.valid) {
      console.log('Données d\'inscription:', this.registerFormGroup.value);
      alert('Fonctionnalité d\'inscription à implémenter côté backend');
    }
  }
}
