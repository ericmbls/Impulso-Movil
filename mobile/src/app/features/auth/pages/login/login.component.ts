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

  private loadSavedEmail() {
    const saved = localStorage.getItem('saved_email');
    if (saved) {
      this.email = saved;
      this.rememberMe = true;
    }
  }

  onRememberChange() {
    if (this.rememberMe) {
      localStorage.setItem('saved_email', this.email);
    } else {
      localStorage.removeItem('saved_email');
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  async login() {
    if (!this.email || !this.password) {
      this.showToast('Ingresa tu correo y contraseña.', 'warning');
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.showToast('El correo no tiene un formato válido.', 'danger');
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
          await this.storageService.saveToken(response.accessToken);

          this.authService.getProfile()
            .pipe(first())
            .subscribe({
              next: async (profile: any) => {
                await this.storageService.saveUser(profile);
                this.authState.setUser(profile);
                this.isLoading = false;
                await this.router.navigateByUrl('/app/dashboard', { replaceUrl: true });
              },
              error: async () => {
                this.isLoading = false;
                this.showAlert('Error', 'No se pudo obtener tu perfil. Intenta de nuevo.');
              }
            });
        },
        error: async (err) => {
          this.isLoading = false;
          let message = 'Usuario o contraseña incorrectos.';
          if (err.status === 0) {
            message = 'Error de conexión. Verifica tu internet.';
          } else if (err.status === 401) {
            message = 'Credenciales inválidas. Verifica tus datos.';
          }
          this.showAlert('Inicio de sesión fallido', message);
        }
      });
  }

  private isValidEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  private async showToast(message: string, color: 'success' | 'danger' | 'warning' = 'danger') {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'bottom',
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertCtrl.create({
      header,
      message,
      buttons: ['Entendido'],
      backdropDismiss: false
    });
    await alert.present();
  }
}