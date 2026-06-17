import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-average-card',
  standalone: true,
  imports: [],
  templateUrl: './average-card.component.html',
  styleUrl: './average-card.component.scss',
})
export class AverageCardComponent {

  @Input() average = '9.2';

  @Input() label = 'Promedio General';

  @Input() description = 'Excelente desempeño';

}