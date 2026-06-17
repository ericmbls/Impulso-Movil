import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { StudentCardComponent } from '../../../../shared/components/dashboard/student-card/student-card.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { QuickActionCardComponent } from '../../../../shared/components/quick-action-card/quick-action-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonContent,
    StudentCardComponent,
    StatCardComponent,
    QuickActionCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {}