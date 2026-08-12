import {
  Injectable,
  inject,
} from '@angular/core';
import {
  HttpClient,
} from '@angular/common/http';
import {
  Router,
} from '@angular/router';
import {
  Capacitor,
} from '@capacitor/core';
import {
  ActionPerformed,
  PushNotificationSchema,
  PushNotifications,
  Token,
} from '@capacitor/push-notifications';

import {
  environment,
} from '@env/environment';

import {
  NotificationService,
} from '@features/notifications/services/notification.service';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private readonly http =
    inject(HttpClient);

  private readonly router =
    inject(Router);

  private readonly notificationService =
    inject(NotificationService);

  private readonly apiUrl =
    `${environment.apiUrl}/push`;

  private initialized = false;

  private currentToken:
    string | null = null;

  async initialize(): Promise<void> {
    console.log(
      '[PUSH] initialize() ejecutado',
    );

    console.log(
      '[PUSH] plataforma:',
      Capacitor.getPlatform(),
    );

    console.log(
      '[PUSH] native:',
      Capacitor.isNativePlatform(),
    );

    if (
      this.initialized
    ) {
      console.log(
        '[PUSH] ya estaba inicializado',
      );

      return;
    }

    if (
      !Capacitor.isNativePlatform()
    ) {
      console.log(
        '[PUSH] no es plataforma nativa',
      );

      return;
    }

    this.initialized = true;

    try {
      console.log(
        '[PUSH] registrando listeners',
      );

      await this.registerListeners();

      console.log(
        '[PUSH] consultando permisos',
      );

      const permissions =
        await PushNotifications
          .checkPermissions();

      console.log(
        '[PUSH] permisos actuales:',
        permissions.receive,
      );

      let receive =
        permissions.receive;

      if (
        receive === 'prompt'
      ) {
        console.log(
          '[PUSH] solicitando permisos',
        );

        const requested =
          await PushNotifications
            .requestPermissions();

        receive =
          requested.receive;

        console.log(
          '[PUSH] resultado permiso:',
          receive,
        );
      }

      if (
        receive !== 'granted'
      ) {
        console.log(
          '[PUSH] permiso no concedido',
        );

        this.initialized = false;

        return;
      }

      console.log(
        '[PUSH] llamando register()',
      );

      await PushNotifications
        .register();

      console.log(
        '[PUSH] register() solicitado',
      );
    } catch (error) {
      console.error(
        '[PUSH] error inicializando:',
        error,
      );

      this.initialized = false;
    }
  }

  async unregister(): Promise<void> {
    if (
      !Capacitor.isNativePlatform()
    ) {
      return;
    }

    if (
      this.currentToken
    ) {
      await this.unregisterToken(
        this.currentToken,
      );
    }

    try {
      await PushNotifications
        .unregister();

      await PushNotifications
        .removeAllListeners();
    } finally {
      this.currentToken =
        null;

      this.initialized =
        false;
    }
  }

  private async registerListeners():
    Promise<void> {
    await PushNotifications
      .removeAllListeners();

    await PushNotifications
      .addListener(
        'registration',
        (
          token: Token,
        ) => {
          console.log(
            '[PUSH] token FCM recibido',
          );

          this.currentToken =
            token.value;

          this.registerToken(
            token.value,
          );
        },
      );

    await PushNotifications
      .addListener(
        'registrationError',
        (
          error: any,
        ) => {
          console.error(
            '[PUSH] registrationError:',
            error,
          );
        },
      );

    await PushNotifications
      .addListener(
        'pushNotificationReceived',
        (
          notification:
            PushNotificationSchema,
        ) => {
          console.log(
            '[PUSH] notificación recibida en foreground',
          );

          this.notificationService
            .notifyChanged();
        },
      );

    await PushNotifications
      .addListener(
        'pushNotificationActionPerformed',
        (
          action:
            ActionPerformed,
        ) => {
          console.log(
            '[PUSH] notificación abierta',
          );

          this.handleAction(
            action,
          );
        },
      );
  }

  private registerToken(
    token: string,
  ): void {
    console.log(
      '[PUSH] enviando token al backend',
    );

    const platform =
      Capacitor.getPlatform() ===
      'ios'
        ? 'FCM_IOS'
        : 'FCM_ANDROID';

    this.http
      .post(
        `${this.apiUrl}/register`,
        {
          token,
          platform,
        },
      )
      .subscribe({
        next: () => {
          console.log(
            '[PUSH] token registrado en backend',
          );
        },

        error: (
          error,
        ) => {
          console.error(
            '[PUSH] error registrando token en backend:',
            error,
          );
        },
      });
  }

  private unregisterToken(
    token: string,
  ): Promise<void> {
    return new Promise(
      (
        resolve,
      ) => {
        this.http
          .delete(
            `${this.apiUrl}/unregister`,
            {
              params: {
                token,
              },
            },
          )
          .subscribe({
            next: () =>
              resolve(),

            error: () =>
              resolve(),
          });
      },
    );
  }

  private handleAction(
    action:
      ActionPerformed,
  ): void {
    const data =
      action.notification.data;

    this.notificationService
      .notifyChanged();

    this.router.navigate(
      ['/app/notifications'],
      {
        queryParams:
          data?.notificationId
            ? {
                notification:
                  data.notificationId,
              }
            : undefined,
      },
    );
  }
}