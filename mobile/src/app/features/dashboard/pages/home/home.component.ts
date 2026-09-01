// home.component.ts
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { calendarOutline, chatbubbleOutline, logoWhatsapp, mailOutline, notificationsOutline, phonePortraitOutline, starOutline } from 'ionicons/icons';
import { StudentCardComponent } from '@shared/components/dashboard/student-card/student-card.component';
import { StatCardComponent } from '@shared/components/stat-card/stat-card.component';
import { AuthStateService } from '@core/auth/services/auth-state.service';
import { DashboardGrade, DashboardNotification, DashboardService } from '@features/dashboard/services/dashboard.service';

interface StatItem {
  icon: string;
  value: string;
  title: string;
  subtitle: string;
}

interface RecentActivity {
  id: number | string;
  icon: string;
  text: string;
  time: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [IonContent, IonIcon, StudentCardComponent, StatCardComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent implements OnInit {
  average = '—';
  attendance = '—';
  recentActivities: RecentActivity[] = [];
  isLoadingStats = false;
  isLoadingActivities = false;
  statsError = false;
  activitiesError = false;

  constructor(
    public readonly authState: AuthStateService,
    private readonly dashboardService: DashboardService,
    private readonly router: Router,
  ) {
    addIcons({ calendarOutline, chatbubbleOutline, logoWhatsapp, mailOutline, notificationsOutline, phonePortraitOutline, starOutline });
  }

  ngOnInit(): void {
    const user = this.authState.user();
    if (!user) return;
    this.loadRecentActivities();
    if (user.role === 'STUDENT' && user.studentProfile) {
      this.loadStudentDashboard(user.studentProfile.id);
    }
  }

  private loadStudentDashboard(studentId: number): void {
    this.isLoadingStats = true;
    this.statsError = false;
    let pendingRequests = 2;
    const requestFinished = (): void => {
      pendingRequests -= 1;
      if (pendingRequests <= 0) this.isLoadingStats = false;
    };

    this.dashboardService.getGrades(studentId).subscribe({
      next: grades => { this.average = this.calculateAverage(grades); requestFinished(); },
      error: error => {
        console.warn('[DASHBOARD] No fue posible cargar calificaciones:', error);
        this.average = '—';
        this.statsError = true;
        requestFinished();
      }
    });

    this.dashboardService.getAttendanceStats(studentId).subscribe({
      next: stats => {
        const rate = Number(stats?.attendanceRate);
        if (Number.isFinite(rate)) this.attendance = `${this.formatPercentage(rate)}%`;
        else this.attendance = '—';
        requestFinished();
      },
      error: error => {
        console.warn('[DASHBOARD] No fue posible cargar asistencia:', error);
        this.attendance = '—';
        this.statsError = true;
        requestFinished();
      }
    });
  }

  private loadRecentActivities(): void {
    this.isLoadingActivities = true;
    this.activitiesError = false;
    this.dashboardService.getNotifications().subscribe({
      next: notifications => {
        this.recentActivities = [...notifications]
          .sort((a, b) => this.getDateTimestamp(b.createdAt) - this.getDateTimestamp(a.createdAt))
          .slice(0, 5)
          .map(notification => this.mapNotification(notification));
        this.isLoadingActivities = false;
      },
      error: error => {
        console.warn('[DASHBOARD] No fue posible cargar la actividad reciente:', error);
        this.recentActivities = [];
        this.activitiesError = true;
        this.isLoadingActivities = false;
      }
    });
  }

  private calculateAverage(grades: DashboardGrade[]): string {
    const finalGrades = grades.map(g => g.finalGrade).filter((g): g is number => typeof g === 'number' && Number.isFinite(g));
    if (!finalGrades.length) return '—';
    const total = finalGrades.reduce((sum, g) => sum + g, 0);
    return (total / finalGrades.length).toFixed(1);
  }

  private mapNotification(notification: DashboardNotification): RecentActivity {
    return {
      id: notification.id,
      icon: this.getNotificationIcon(notification.channel),
      text: notification.content,
      time: this.formatDate(notification.createdAt),
    };
  }

  private getNotificationIcon(channel?: string | null): string {
    switch (channel) {
      case 'EMAIL': return 'mail-outline';
      case 'SMS': return 'chatbubble-outline';
      case 'WHATSAPP': return 'logo-whatsapp';
      case 'PUSH': return 'phone-portrait-outline';
      case 'IN_APP': return 'notifications-outline';
      default: return 'notifications-outline';
    }
  }

  get fullName(): string {
    const user = this.authState.user();
    if (!user) return '';
    return [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  }

  get role(): string {
    const user = this.authState.user();
    if (!user) return '';
    switch (user.role) {
      case 'STUDENT': return 'Alumno';
      case 'TEACHER': return 'Docente';
      case 'ADMIN': return 'Administrador';
      case 'PARENT': return 'Tutor';
      default: return '';
    }
  }

  get stats(): StatItem[] {
    const user = this.authState.user();
    if (!user || user.role !== 'STUDENT') return [];
    return [
      { icon: 'calendar-outline', value: this.attendance, title: 'Asistencia', subtitle: 'General' },
      { icon: 'star-outline', value: this.average, title: 'Promedio', subtitle: 'General' },
    ];
  }

  goToNotifications(): void {
    void this.router.navigateByUrl('/app/notifications');
  }

  private formatPercentage(value: number): string {
    const normalized = Math.min(100, Math.max(0, value));
    return Number.isInteger(normalized) ? normalized.toString() : normalized.toFixed(1);
  }

  private getDateTimestamp(date: string): number {
    const timestamp = new Date(date).getTime();
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  private formatDate(date: string): string {
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return '';
    return parsedDate.toLocaleString('es-MX', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  }
}