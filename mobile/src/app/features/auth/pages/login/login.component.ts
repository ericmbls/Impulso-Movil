import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonCheckbox,
  IonIcon
} from '@ionic/angular/standalone';

import { AuthService } from '../../../../core/services/auth.service';
import { StorageService } from '../../../../core/services/storage.service';
import { AuthStateService } from '../../../../core/services/auth-state.service';

import { addIcons } from 'ionicons';
import {
  mailOutline,
  lockClosedOutline,
  eyeOutline,
  eyeOffOutline,
  logInOutline,
  schoolOutline,
  desktopOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    IonContent,
    IonButton,
    IonInput,
    IonItem,
    IonCheckbox,
    IonIcon,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {

  email = '';
  password = '';
  isLoading = false;
  rememberMe = false;
  showPassword = false;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private authState: AuthStateService,
    private router: Router
  ) {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      logInOutline,
      schoolOutline,
      desktopOutline
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.email || !this.password) {
      alert('Ingrese usuario y contraseña.');
      return;
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password).subscribe({
      next: async (response: any) => {
        await this.storageService.saveToken(response.accessToken);

        this.authService.getProfile().subscribe({
          next: async (profile: any) => {
            await this.storageService.saveUser(profile);
            this.authState.setUser(profile);
            this.isLoading = false;
            await this.router.navigateByUrl('/app/dashboard', {
              replaceUrl: true
            });
          },
          error: () => {
            this.isLoading = false;
            alert('No se pudo obtener el perfil.');
          }
        });
      },
      error: () => {
        this.isLoading = false;
        alert('Usuario o contraseña incorrectos.');
      }
    });
  }
}