import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { IonContent, IonButton, IonInput, IonItem, IonCheckbox, IonIcon } from '@ionic/angular/standalone';
import { AuthService } from '@core/auth/services/auth.service';
import { StorageService } from '@core/http/services/storage.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { PushNotificationService } from '@core/auth/services/push-notification.service';
import { FeedbackService } from '@core/shared/services/feedback.service';
import { addIcons } from 'ionicons';
import { mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, logInOutline, schoolOutline, desktopOutline, refreshOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [IonContent, IonButton, IonInput, IonItem, IonCheckbox, IonIcon, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;

  constructor(
    private readonly authService: AuthService,
    private readonly storageService: StorageService,
    private readonly authState: AuthStateService,
    private readonly pushService: PushNotificationService,
    private readonly feedback: FeedbackService,
    private readonly router: Router,
  ) {
    addIcons({ mailOutline, lockClosedOutline, eyeOutline, eyeOffOutline, logInOutline, schoolOutline, desktopOutline, refreshOutline });
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
    if (this.isLoading) return;
    this.showPassword = !this.showPassword;
  }

  async login(): Promise<void> {
    if (this.isLoading) return;
    const email = this.email.trim();
    if (!email || !this.password) {
      await this.feedback.warning('Ingresa tu correo y contraseña.');
      return;
    }
    if (!this.isValidEmail(email)) {
      await this.feedback.error('El correo no tiene un formato válido.');
      return;
    }
    this.email = email;
    if (this.rememberMe) {
      localStorage.setItem('saved_email', this.email);
    } else {
      localStorage.removeItem('saved_email');
    }
    this.isLoading = true;
    try {
      const response: any = await firstValueFrom(this.authService.login(this.email, this.password));
      await this.storageService.saveToken(response.accessToken);
      const profile = await firstValueFrom(this.authService.getProfile());
      await this.storageService.saveUser(profile);
      this.authState.setUser(profile);
      try {
        await this.pushService.initialize();
      } catch (pushError) {
        console.error('[PUSH] No fue posible inicializar notificaciones:', pushError);
      }
      await this.feedback.success('Sesión iniciada correctamente.', 1800);
      await this.router.navigateByUrl('/app/dashboard', { replaceUrl: true });
    } catch (error: any) {
      let message = 'No fue posible iniciar sesión.';
      if (error?.status === 0) {
        message = 'No fue posible conectarse al servidor.';
      } else if (error?.status === 401) {
        message = 'Correo o contraseña incorrectos.';
      } else if (error?.status === 403) {
        message = 'Tu cuenta no tiene autorización para ingresar.';
      } else if (error?.status >= 500) {
        message = 'El servidor no está disponible en este momento.';
      } else if (error?.error?.message) {
        message = Array.isArray(error.error.message) ? error.error.message.join('. ') : error.error.message;
      }
      await this.feedback.error(message, 4000);
    } finally {
      this.isLoading = false;
    }
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
}