import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calendarOutline,
  starOutline,
  cardOutline,
  checkmarkCircleOutline,
  notificationsOutline,
  personOutline,
  timeOutline,
  schoolOutline,
  bookOutline,
  megaphoneOutline,
  peopleOutline
} from 'ionicons/icons';

import { StudentCardComponent } from '@shared/components/dashboard/student-card/student-card.component';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { DashboardService } from '@features/dashboard/services/dashboard.service';

type StatItem = {
  icon: string;
  value: string;
  title: string;
  subtitle: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    StudentCardComponent,
    StatCardComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  average = '0.0';
  attendance = '0%';
  nextClasses: any[] = [];
  recentActivities: any[] = [];

  constructor(
    public authState: AuthStateService,
    private dashboardService: DashboardService,
    private router: Router
  ) {
    addIcons({
      calendarOutline,
      starOutline,
      cardOutline,
      checkmarkCircleOutline,
      notificationsOutline,
      personOutline,
      timeOutline,
      schoolOutline,
      bookOutline,
      megaphoneOutline,
      peopleOutline
    });
  }

  ngOnInit(): void {
    const user = this.authState.user();
    if (!user) return;
    if (user.role === 'STUDENT' && user.studentProfile) {
      this.loadStudentDashboard(user.studentProfile.id, user.studentProfile.groupId);
    }
  }

  private loadStudentDashboard(studentId: number, groupId: number): void {
    this.dashboardService.getGrades(studentId).subscribe({
      next: grades => {
        if (grades.length) {
          const total = grades.reduce((sum: number, grade: any) => sum + (grade.finalGrade ?? 0), 0);
          this.average = (total / grades.length).toFixed(1);
          this.recentActivities = grades
            .sort((a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
            .slice(0, 5)
            .map((grade: any) => ({
              id: grade.id,
              icon: 'checkmark-circle-outline',
              text: `Calificación actualizada en ${grade.subject.name}`,
              time: new Date(grade.updatedAt).toLocaleDateString()
            }));
        }
      }
    });

    this.dashboardService.getAttendanceStats(studentId).subscribe({
      next: stats => {
        if (stats?.attendanceRate !== undefined) {
          this.attendance = `${stats.attendanceRate}%`;
        }
      }
    });

    this.dashboardService.getSchedule(groupId).subscribe({
      next: schedule => {
        this.nextClasses = schedule.map((item: any) => ({
          name: item.class.subject.name,
          time: `${item.startTime} - ${item.endTime}`,
          room: item.classroom?.name ?? 'Sin aula',
          remaining: '',
          color: '#7d1736'
        }));
      }
    });
  }

  get fullName(): string {
    const user = this.authState.user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  }

  get role(): string {
    const user = this.authState.user();
    if (!user) return '';
    switch (user.role) {
      case 'STUDENT': return 'Alumno';
      case 'TEACHER': return 'Docente';
      case 'ADMIN': return 'Administrador';
      case 'PARENT': return 'Padre de familia';
      default: return user.role;
    }
  }

  get stats(): StatItem[] {
    const user = this.authState.user();
    if (!user) return [];

    switch (user.role) {
      case 'STUDENT':
        return [
          { icon: 'calendar-outline', value: this.attendance, title: 'Asistencia', subtitle: 'Actual' },
          { icon: 'star-outline', value: this.average, title: 'Promedio', subtitle: 'General' }
        ];
      case 'TEACHER':
        return [
          { icon: 'people-outline', value: '5', title: 'Grupos', subtitle: 'Activos' },
          { icon: 'person-outline', value: '120', title: 'Alumnos', subtitle: 'Totales' },
          { icon: 'calendar-outline', value: '4', title: 'Clases hoy', subtitle: 'Pendientes' }
        ];
      case 'ADMIN':
        return [
          { icon: 'people-outline', value: '23', title: 'Docentes', subtitle: 'Activos' },
          { icon: 'school-outline', value: '18', title: 'Grupos', subtitle: 'Totales' },
          { icon: 'calendar-outline', value: '8', title: 'Clases hoy', subtitle: 'En curso' }
        ];
      case 'PARENT':
        return [
          { icon: 'star-outline', value: this.average, title: 'Promedio', subtitle: 'Hijo(a)' },
          { icon: 'calendar-outline', value: this.attendance, title: 'Asistencia', subtitle: 'Actual' }
        ];
      default:
        return [];
    }
  }

  goToSchedule(): void {
    this.router.navigateByUrl('/app/schedule');
  }

  goToNotifications(): void {
    this.router.navigateByUrl('/app/notifications');
  }
}