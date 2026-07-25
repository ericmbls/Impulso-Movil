import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { first } from 'rxjs/operators';

import {
  IonContent,
  IonButton,
  IonInput,
  IonItem,
  IonCheckbox,
  IonIcon,
  ToastController,
  AlertController
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
  desktopOutline,
  refreshOutline
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
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private authState: AuthStateService,
    private router: Router,
    private toastCtrl: ToastController,
    private alertCtrl: AlertController
  ) {
    addIcons({
      mailOutline,
      lockClosedOutline,
      eyeOutline,
      eyeOffOutline,
      logInOutline,
      schoolOutline,
      desktopOutline,
      refreshOutline
    });

    this.loadSavedEmail();
  }

  private loadSavedEmail(): void {
    const savedEmail = localStorage.getItem('saved_email');

    if (savedEmail) {
      this.email = savedEmail;
      this.rememberMe = true;
    }
  }

  onRememberChange(): void {
    if (this.rememberMe) {
      localStorage.setItem('saved_email', this.email);
    } else {
      localStorage.removeItem('saved_email');
    }
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  async login(): Promise<void> {

    if (!this.email || !this.password) {
      await this.showToast('Ingresa tu correo y contraseña.', 'warning');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      await this.showToast('El correo no tiene un formato válido.', 'danger');
      return;
    }

    if (this.rememberMe) {
      localStorage.setItem('saved_email', this.email);
    } else {
      localStorage.removeItem('saved_email');
    }

    this.isLoading = true;

    this.authService.login(this.email, this.password)
      .pipe(first())
      .subscribe({
        next: async (response: any) => {

          try {

            await this.storageService.saveToken(response.accessToken);

            const profile = await this.authService
              .getProfile()
              .pipe(first())
              .toPromise();

            await this.storageService.saveUser(profile);

            this.authState.setUser(profile);

            await this.router.navigateByUrl('/app/dashboard', {
              replaceUrl: true
            });

          } catch {

            await this.showAlert(
              'Error',
              'No fue posible obtener la información del usuario.'
            );

          } finally {

            this.isLoading = false;

          }

        },
        error: async (error) => {

          this.isLoading = false;

          let message = 'Usuario o contraseña incorrectos.';

          if (error.status === 0) {
            message = 'No fue posible conectarse al servidor.';
          }

          if (error.status === 401) {
            message = 'Credenciales inválidas.';
          }

          await this.showAlert(
            'Inicio de sesión fallido',
            message
          );

        }
      });

  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private async showToast(
    message: string,
    color: 'success' | 'danger' | 'warning' = 'danger'
  ): Promise<void> {

    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [
        {
          text: 'OK',
          role: 'cancel'
        }
      ]
    });

    await toast.present();

  }

  private async showAlert(
    header: string,
    message: string
  ): Promise<void> {

    const alert = await this.alertCtrl.create({
      header,
      message,
      backdropDismiss: false,
      buttons: ['Entendido']
    });

    await alert.present();

  }

}