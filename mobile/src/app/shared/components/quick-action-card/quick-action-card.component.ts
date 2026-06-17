import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-quick-action-card',
  standalone: true,
  imports: [IonIcon],
  templateUrl: './quick-action-card.component.html',
  styleUrl: './quick-action-card.component.scss',
})
export class QuickActionCardComponent {

  @Input() icon = '';

  @Input() title = '';

}