import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { IonButton, IonCheckbox, IonContent, IonIcon, IonInput, IonItem } from '@ionic/angular/standalone';
import { AuthLoginResponse, AuthService } from '@core/auth/services/auth.service';
import { StorageService } from '@core/http/services/storage.service';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { PushNotificationService } from '@core/auth/services/push-notification.service';
import { FeedbackService } from '@core/shared/services/feedback.service';
import { addIcons } from 'ionicons';
import { desktopOutline, eyeOffOutline, eyeOutline, lockClosedOutline, logInOutline, mailOutline, refreshOutline, schoolOutline } from 'ionicons/icons';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, IonButton, IonCheckbox, IonContent, IonIcon, IonInput, IonItem],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnDestroy {
  email = '';
  password = '';
  rememberMe = false;
  showPassword = false;
  isLoading = false;
  submitted = false;

  private readonly savedEmailKey = 'saved_email';
  private destroyed = false;

  constructor(
    private readonly authService: AuthService,
    private readonly storageService: StorageService,
    private readonly authState: AuthStateService,
    private readonly pushService: PushNotificationService,
    private readonly feedback: FeedbackService,
    private readonly router: Router,
  ) {
    addIcons({ desktopOutline, eyeOffOutline, eyeOutline, lockClosedOutline, logInOutline, mailOutline, refreshOutline, schoolOutline });
    this.loadSavedEmail();
  }

  get normalizedEmail(): string {
    return this.email.trim().toLowerCase();
  }

  get emailInvalid(): boolean {
    if (!this.submitted) return false;
    return !this.normalizedEmail || !this.isValidEmail(this.normalizedEmail);
  }

  get passwordInvalid(): boolean {
    if (!this.submitted) return false;
    return !this.password.trim();
  }

  get canSubmit(): boolean {
    return !this.isLoading && !!this.email.trim() && !!this.password;
  }

  private loadSavedEmail(): void {
    try {
      const savedEmail = localStorage.getItem(this.savedEmailKey);
      if (!savedEmail) return;
      this.email = savedEmail;
      this.rememberMe = true;
    } catch (error) {
      console.warn('[LOGIN] No fue posible recuperar el correo guardado:', error);
    }
  }

  onRememberChange(): void {
    if (!this.rememberMe) {
      this.removeSavedEmail();
      return;
    }
    const email = this.normalizedEmail;
    if (email) {
      this.saveEmail(email);
    }
  }

  private saveEmail(email: string): void {
    try {
      localStorage.setItem(this.savedEmailKey, email);
    } catch (error) {
      console.warn('[LOGIN] No fue posible guardar el correo:', error);
    }
  }

  private removeSavedEmail(): void {
    try {
      localStorage.removeItem(this.savedEmailKey);
    } catch (error) {
      console.warn('[LOGIN] No fue posible eliminar el correo guardado:', error);
    }
  }

  togglePassword(): void {
    if (this.isLoading) return;
    this.showPassword = !this.showPassword;
  }

  async login(): Promise<void> {
    if (this.isLoading) return;
    this.submitted = true;
    const email = this.normalizedEmail;
    const password = this.password;

    if (!email || !password) {
      await this.feedback.warning('Ingresa tu correo y contraseña.');
      return;
    }
    if (!this.isValidEmail(email)) {
      await this.feedback.warning('Ingresa un correo válido.');
      return;
    }
    this.email = email;
    this.isLoading = true;

    try {
      const response: AuthLoginResponse = await firstValueFrom(this.authService.login(email, password));
      const accessToken = response.accessToken;
      if (!accessToken) {
        throw new Error('El servidor no devolvió un token de acceso.');
      }
      await this.storageService.saveToken(accessToken);
      const profile = await firstValueFrom(this.authService.getProfile());
      if (!profile) {
        throw new Error('No fue posible recuperar el perfil del usuario.');
      }
      await this.storageService.saveUser(profile);
      this.authState.setUser(profile);

      if (this.rememberMe) {
        this.saveEmail(email);
      } else {
        this.removeSavedEmail();
      }

      void this.pushService.initialize().catch(pushError => {
        console.warn('[PUSH] No fue posible inicializar las notificaciones:', pushError);
      });

      await this.router.navigateByUrl('/app/dashboard', { replaceUrl: true });
      if (!this.destroyed) {
        void this.feedback.success('Sesión iniciada correctamente.', 1800);
      }
    } catch (error: any) {
      console.error('[LOGIN] Error:', error);
      await this.clearPartialSession();
      const message = this.getLoginErrorMessage(error);
      if (!this.destroyed) {
        await this.feedback.error(message, 4000);
      }
    } finally {
      if (!this.destroyed) {
        this.isLoading = false;
      }
    }
  }

  private async clearPartialSession(): Promise<void> {
    try {
      await this.storageService.clear();
      this.authState.clear();
    } catch (error) {
      console.warn('[LOGIN] No fue posible limpiar la sesión parcial:', error);
      this.authState.clear();
    }
  }

  private getLoginErrorMessage(error: any): string {
    if (error?.status === 0) {
      return 'No fue posible conectarse al servidor. Verifica tu conexión a internet.';
    }
    if (error?.status === 401) {
      return 'Correo o contraseña incorrectos.';
    }
    if (error?.status === 403) {
      return 'Tu cuenta no tiene autorización para ingresar.';
    }
    if (error?.status === 429) {
      return 'Se realizaron demasiados intentos. Intenta nuevamente más tarde.';
    }
    if (error?.status >= 500) {
      return 'El servidor no está disponible en este momento.';
    }
    const backendMessage = error?.error?.message;
    if (Array.isArray(backendMessage)) {
      return backendMessage.join('. ');
    }
    if (typeof backendMessage === 'string' && backendMessage.trim()) {
      return backendMessage;
    }
    if (typeof error?.message === 'string' && error.message.trim()) {
      return error.message;
    }
    return 'No fue posible iniciar sesión.';
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }
}