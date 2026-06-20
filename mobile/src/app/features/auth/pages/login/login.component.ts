import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonCheckbox
} from '@ionic/angular/standalone';

import { AuthService } from '../../../../core/services/auth.service';
import { StorageService } from '../../../../core/services/storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonCheckbox,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {

  email = '';
  password = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) {}

  login() {

    if (!this.email || !this.password) {
      alert('Ingrese usuario y contraseña.');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({

      next: async (response: any) => {

        await this.storageService.saveToken(response.accessToken);
        await this.storageService.saveUser(response.user);

        this.isLoading = false;

        await this.router.navigateByUrl('/app/dashboard', {
          replaceUrl: true
        });

      },

      error: () => {

        this.isLoading = false;

        alert('Usuario o contraseña incorrectos.');

      }

    });

  }

}