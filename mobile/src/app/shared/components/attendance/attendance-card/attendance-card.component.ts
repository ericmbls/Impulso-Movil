import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-attendance-card',
  standalone: true,
  imports: [],
  templateUrl: './attendance-card.component.html',
  styleUrl: './attendance-card.component.scss',
})
export class AttendanceCardComponent {

  @Input() subject = '';

  @Input() status = '';

  @Input() present = true;

}