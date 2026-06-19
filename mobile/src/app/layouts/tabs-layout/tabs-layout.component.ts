import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IonTabs,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  homeOutline,
  calendarOutline,
  qrCodeOutline,
  statsChartOutline,
  personOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs-layout',
  standalone: true,
  imports: [
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    RouterLink
  ],
  templateUrl: './tabs-layout.component.html',
  styleUrls: ['./tabs-layout.component.scss']
})
export class TabsLayoutComponent {

  constructor() {

    addIcons({
      homeOutline,
      calendarOutline,
      qrCodeOutline,
      statsChartOutline,
      personOutline
    });

  }

}