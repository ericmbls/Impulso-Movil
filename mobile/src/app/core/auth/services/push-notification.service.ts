import { Injectable } from '@angular/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  constructor(private http: HttpClient) {}

  async initialize(): Promise<void> {
    const permission = await PushNotifications.requestPermissions();

    if (permission.receive !== 'granted') {
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token: Token) => {
      console.log('FCM Token:', token.value);

      this.http
        .post(`${environment.apiUrl}/push/register`, {
          token: token.value,
          platform: 'FCM_ANDROID',
          userAgent: navigator.userAgent,
        })
        .subscribe({
          next: () => console.log('Token registrado'),
          error: (err) => console.error(err),
        });
    });

    PushNotifications.addListener('registrationError', error => {
      console.error(error);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push recibida', notification);
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (notification: ActionPerformed) => {
        console.log('Push abierta', notification);
      }
    );
  }
}