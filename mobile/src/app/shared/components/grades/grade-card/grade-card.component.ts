import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-grade-card',
  standalone: true,
  imports: [],
  templateUrl: './grade-card.component.html',
  styleUrl: './grade-card.component.scss',
})
export class GradeCardComponent {

  @Input() subject = '';

  @Input() teacher = '';

  @Input() grade = '';

  @Input() status = '';

}