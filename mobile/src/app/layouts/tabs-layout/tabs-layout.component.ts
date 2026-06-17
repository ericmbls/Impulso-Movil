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
  statsChartOutline,
  personOutline,
  menuOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs-layout',
  standalone: true,
  imports: [
    RouterLink,
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel
  ],
  templateUrl: './tabs-layout.component.html',
  styleUrls: ['./tabs-layout.component.scss']
})
export class TabsLayoutComponent {

  constructor() {

    addIcons({
      homeOutline,
      calendarOutline,
      statsChartOutline,
      personOutline,
      menuOutline
    });

  }

}