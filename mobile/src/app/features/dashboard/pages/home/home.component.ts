import { Component } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';

import { StudentCardComponent } from '../../../../shared/components/dashboard/student-card/student-card.component';
import { StatCardComponent } from '../../../../shared/components/stat-card/stat-card.component';
import { QuickActionCardComponent } from '../../../../shared/components/quick-action-card/quick-action-card.component';
import { ClassCardComponent } from '../../../../shared/components/dashboard/class-card/class-card.component';
import { AnnouncementCardComponent } from '../../../../shared/components/dashboard/announcement-card/announcement-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    IonContent,
    StudentCardComponent,
    StatCardComponent,
    QuickActionCardComponent,
    ClassCardComponent,
    AnnouncementCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {}