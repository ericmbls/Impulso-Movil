import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-schedule-card',
  standalone: true,
  templateUrl: './schedule-card.component.html',
  styleUrl: './schedule-card.component.scss',
})
export class ScheduleCardComponent {

  @Input() subject = '';

  @Input() teacher = '';

  @Input() classroom = '';

  @Input() time = '';

  @Input() color = '#7d1736';

}