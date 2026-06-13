import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-quick-action-card',
  standalone: true,
  templateUrl: './quick-action-card.component.html',
  styleUrl: './quick-action-card.component.scss'
})
export class QuickActionCardComponent {

  @Input() icon = '';

  @Input() title = '';

}