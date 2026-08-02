import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';

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

import { AuthService } from '@core/auth/services/auth.service';
import { StorageService } from '@core/http/services/storage.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';

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

    this.email = this.email.trim().toLowerCase();
    this.password = this.password.trim();

    if (!this.isValidEmail(this.email)) {
      await this.showToast('El correo no tiene un formato válido.', 'danger');
      return;
    }

    if (this.password.length < 6) {
      await this.showToast('La contraseña debe tener al menos 6 caracteres.', 'warning');
      return;
    }

    if (this.rememberMe) {
      localStorage.setItem('saved_email', this.email);
    } else {
      localStorage.removeItem('saved_email');
    }

    this.isLoading = true;

    try {
      const response: any = await firstValueFrom(
        this.authService.login(this.email, this.password)
      );

      await this.storageService.saveToken(response.accessToken);

      const profile = await firstValueFrom(this.authService.getProfile());
      await this.storageService.saveUser(profile);
      this.authState.setUser(profile);

      await this.router.navigateByUrl('/app/dashboard', { replaceUrl: true });
    } catch (error: any) {
      const message = this.getErrorMessage(error);
      await this.showAlert('Inicio de sesión fallido', message);
    } finally {
      this.isLoading = false;
    }
  }

  private getErrorMessage(error: any): string {
    const serverMessage = error?.error?.message;

    if (Array.isArray(serverMessage)) {
      return serverMessage.join(' ');
    }

    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return serverMessage;
    }

    if (typeof error?.error?.error === 'string' && error.error.error.trim()) {
      return error.error.error;
    }

    if (error?.status === 0) {
      return 'No fue posible conectarse al servidor. Verifica tu conexión o que el backend esté disponible.';
    }

    if (error?.status === 400) {
      return 'Revisa tu correo y contraseña. La contraseña debe tener al menos 6 caracteres.';
    }

    if (error?.status === 401) {
      return 'Credenciales inválidas. Verifica tu correo y contraseña.';
    }

    if (error?.status === 404) {
      return 'El servicio de autenticación no está disponible.';
    }

    if (error?.status === 500) {
      return 'El servidor devolvió un error inesperado. Intenta de nuevo más tarde.';
    }

    return 'Usuario o contraseña incorrectos.';
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
      buttons: [{ text: 'OK', role: 'cancel' }]
    });
    await toast.present();
  }

  private async showAlert(header: string, message: string): Promise<void> {
    const alert = await this.alertCtrl.create({
      header,
      message,
      backdropDismiss: false,
      buttons: ['Entendido']
    });
    await alert.present();
  }
}