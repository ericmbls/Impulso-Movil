import { Component } from '@angular/core';

import {
  IonApp,
  IonRouterOutlet
} from '@ionic/angular/standalone';

import { AuthStateService } from './core/services/auth-state.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    IonApp,
    IonRouterOutlet
  ],
  templateUrl: 'app.component.html'
})
export class AppComponent {

  constructor(
    private authState: AuthStateService
  ) {
    this.initializeApp();
  }

  async initializeApp() {
    await this.authState.loadUser();
  }

}