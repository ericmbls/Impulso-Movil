import { Component, OnInit } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { PushNotificationService } from '@core/auth/services/push-notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [IonApp, IonRouterOutlet],
  templateUrl: 'app.component.html'
})
export class AppComponent implements OnInit {
  constructor(
    private authState: AuthStateService,
    private pushService: PushNotificationService
  ) {}

  async ngOnInit() {
    await this.authState.loadUser();
    await this.pushService.initialize();
  }
}