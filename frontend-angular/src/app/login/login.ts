import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Authentication } from '../services/authentication';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  public loginFormGroup!: FormGroup;

  constructor(private fb: FormBuilder, private authService: Authentication, private router: Router) {}

  ngOnInit() {
    this.loginFormGroup = this.fb.group({
      username: this.fb.control(''),
      password: this.fb.control('')
    });
  }

 login() {
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
