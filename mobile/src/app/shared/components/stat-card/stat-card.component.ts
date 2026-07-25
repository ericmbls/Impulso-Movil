import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';

import {
  calendarOutline,
  starOutline,
  peopleOutline,
  personOutline,
  schoolOutline,
  checkmarkCircleOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [
    IonIcon
  ],
  templateUrl: './stat-card.component.html',
  styleUrls: ['./stat-card.component.scss']
})
export class StatCardComponent {

  @Input({ required: true }) value!: string;

  @Input({ required: true }) title!: string;

  @Input() subtitle = '';

  @Input() icon = 'calendar-outline';

  constructor() {

    addIcons({
      calendarOutline,
      starOutline,
      peopleOutline,
      personOutline,
      schoolOutline,
      checkmarkCircleOutline
    });

  }

}