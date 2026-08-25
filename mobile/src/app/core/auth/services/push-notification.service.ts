import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { ActionPerformed, PushNotificationSchema, PushNotifications, Token } from '@capacitor/push-notifications';
import { firstValueFrom } from 'rxjs';
import { environment } from '@env/environment';
import { NotificationService } from '@features/notifications/services/notification.service';

@Injectable({ providedIn: 'root' })
export class PushNotificationService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly apiUrl = `${environment.apiUrl}/push`;

  private initialized = false;
  private initializing = false;
  private currentToken: string | null = null;

  async initialize(): Promise<void> {
    console.log('[PUSH] initialize() ejecutado');
    console.log('[PUSH] plataforma:', Capacitor.getPlatform());
    console.log('[PUSH] native:', Capacitor.isNativePlatform());

    if (!Capacitor.isNativePlatform()) {
      console.log('[PUSH] no es plataforma nativa');
      return;
    }

    // Si ya se está inicializando, evitamos ejecutar el proceso dos veces al mismo tiempo.
    if (this.initializing) {
      console.log('[PUSH] servicio ya se está inicializando');
      return;
    }

    // Si ya tenemos un token en memoria, lo resincronizamos con el backend.
    if (this.initialized && this.currentToken) {
      console.log('[PUSH] servicio ya inicializado');
      console.log('[PUSH] resincronizando token actual con backend');
      try {
        await this.registerToken(this.currentToken);
      } catch (error) {
        console.error('[PUSH] error resincronizando token:', error);
      }
      return;
    }

    this.initializing = true;
    try {
      // Eliminamos listeners anteriores para evitar duplicados.
      await PushNotifications.removeAllListeners();
      console.log('[PUSH] registrando listeners');
      await this.registerListeners();

      console.log('[PUSH] consultando permisos');
      const permissions = await PushNotifications.checkPermissions();
      let receive = permissions.receive;
      console.log('[PUSH] permisos actuales:', receive);

      if (receive === 'prompt') {
        console.log('[PUSH] solicitando permisos');
        const requested = await PushNotifications.requestPermissions();
        receive = requested.receive;
        console.log('[PUSH] resultado permiso:', receive);
      }

      if (receive !== 'granted') {
        console.warn('[PUSH] permiso no concedido');
        this.initialized = false;
        return;
      }

      console.log('[PUSH] llamando register()');
      // register() provoca que el plugin emita el evento "registration" con el token FCM.
      await PushNotifications.register();
      this.initialized = true;
      console.log('[PUSH] register() solicitado correctamente');
    } catch (error) {
      console.error('[PUSH] error inicializando:', error);
      this.initialized = false;
    } finally {
      this.initializing = false;
    }
  }

  async unregister(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;
    if (this.currentToken) {
      await this.unregisterToken(this.currentToken);
    }
    try {
      await PushNotifications.unregister();
      await PushNotifications.removeAllListeners();
    } catch (error) {
      console.error('[PUSH] error desregistrando push:', error);
    } finally {
      this.currentToken = null;
      this.initialized = false;
      this.initializing = false;
    }
  }

  private async registerListeners(): Promise<void> {
    await PushNotifications.addListener('registration', async (token: Token) => {
      console.log('[PUSH] token FCM recibido:', token.value);
      this.currentToken = token.value;
      try {
        await this.registerToken(token.value);
      } catch (error) {
        console.error('[PUSH] no fue posible registrar el token:', error);
      }
    });

    await PushNotifications.addListener('registrationError', (error: unknown) => {
      console.error('[PUSH] registrationError:', error);
    });

    await PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('[PUSH] notificación recibida en foreground:', notification);
      this.notificationService.notifyChanged();
    });

    await PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
      console.log('[PUSH] notificación abierta:', action);
      this.handleAction(action);
    });
  }

  private async registerToken(token: string): Promise<void> {
    const normalizedToken = token.trim();
    if (!normalizedToken) {
      console.warn('[PUSH] token vacío, no se enviará al backend');
      return;
    }
    const platform = Capacitor.getPlatform() === 'ios' ? 'FCM_IOS' : 'FCM_ANDROID';
    console.log('[PUSH] enviando token al backend');
    console.log('[PUSH] platform:', platform);
    try {
      const response = await firstValueFrom(
        this.http.post(`${this.apiUrl}/register`, { token: normalizedToken, platform })
      );
      console.log('[PUSH] token registrado en backend:', response);
    } catch (error) {
      console.error('[PUSH] error registrando token en backend:', error);
      throw error;
    }
  }

  private async unregisterToken(token: string): Promise<void> {
    const normalizedToken = token.trim();
    if (!normalizedToken) return;
    try {
      await firstValueFrom(
        this.http.delete(`${this.apiUrl}/unregister`, { params: { token: normalizedToken } })
      );
      console.log('[PUSH] token eliminado del backend');
    } catch (error) {
      console.error('[PUSH] no fue posible eliminar el token del backend:', error);
    }
  }

  private handleAction(action: ActionPerformed): void {
    const data = action.notification.data;
    this.notificationService.notifyChanged();
    void this.router.navigate(['/app/notifications'], {
      queryParams: data?.notificationId ? { notification: data.notificationId } : undefined,
    });
  }
}