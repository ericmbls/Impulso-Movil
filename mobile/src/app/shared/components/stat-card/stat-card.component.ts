import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, starOutline } from 'ionicons/icons';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './stat-card.component.html',
  styleUrl: './stat-card.component.scss',
})
export class StatCardComponent {

  @Input() value = '';
  @Input() title = '';
  @Input() subtitle = '';
  @Input() icon = 'calendar-outline';

  constructor() {
    addIcons({ calendarOutline, starOutline });
  }
}