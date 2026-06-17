import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-attendance-summary',
  standalone: true,
  imports: [],
  templateUrl: './attendance-summary.component.html',
  styleUrl: './attendance-summary.component.scss',
})
export class AttendanceSummaryComponent {

  @Input() percentage = '';

  @Input() status = '';

}