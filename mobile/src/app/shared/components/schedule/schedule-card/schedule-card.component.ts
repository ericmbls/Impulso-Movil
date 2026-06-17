import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { timeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-schedule-card',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './schedule-card.component.html',
  styleUrl: './schedule-card.component.scss',
})
export class ScheduleCardComponent {

  @Input() subject = '';
  @Input() teacher = '';
  @Input() classroom = '';
  @Input() time = '';
  @Input() color = '#7d1736';

  constructor() {
    addIcons({ timeOutline });
  }
}