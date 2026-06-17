import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

import {
  IonApp,
  IonMenu,
  IonContent,
  IonList,
  IonItem,
  IonLabel
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    IonApp,
    IonMenu,
    IonContent,
    IonList,
    IonItem,
    IonLabel,
    RouterLink,
    RouterOutlet
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent {}
