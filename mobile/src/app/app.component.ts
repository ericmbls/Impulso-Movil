import {
  Component,
  OnInit,
} from '@angular/core';

import {
  IonApp,
  IonRouterOutlet,
} from '@ionic/angular/standalone';

import { AuthStateService } from '@core/auth/services/auth-state.service';
import { PushNotificationService } from '@core/auth/services/push-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet,
  ],
  templateUrl:
    'app.component.html',
})
export class AppComponent
  implements OnInit
{
  constructor(
    private authState:
      AuthStateService,

    private pushService:
      PushNotificationService,
  ) {}

  async ngOnInit():
    Promise<void> {
    await this.authState
      .loadUser();

    const user =
      this.authState.user();

    if (!user) {
      return;
    }

    try {
      await this.pushService
        .initialize();
    } catch (
      error
    ) {
      console.error(
        '[PUSH] No fue posible restaurar las notificaciones:',
        error,
      );
    }
  }
}