// dashboard.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface DashboardGrade {
  id?: number;
  finalGrade?: number | null;
}

export interface DashboardAttendanceStats {
  attendanceRate?: number | null;
  total?: number;
  present?: number;
  absent?: number;
  late?: number;
  justified?: number;
}

export interface DashboardScheduleItem {
  id?: number;
  startTime: string;
  endTime: string;
  class: { subject: { name: string }; };
  classroom?: { name: string } | null;
}

export interface DashboardNotification {
  id: number | string;
  channel?: string | null;
  content: string;
  createdAt: string;
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly gradesApi = `${environment.apiUrl}/grades`;
  private readonly attendanceApi = `${environment.apiUrl}/attendance`;
  private readonly schedulesApi = `${environment.apiUrl}/schedules`;
  private readonly notificationsApi = `${environment.apiUrl}/notifications`;

  getGrades(studentId: number): Observable<DashboardGrade[]> {
    return this.http.get<DashboardGrade[]>(`${this.gradesApi}/student/${studentId}`);
  }

  getAttendanceStats(studentId: number): Observable<DashboardAttendanceStats> {
    return this.http.get<DashboardAttendanceStats>(`${this.attendanceApi}/stats/student/${studentId}`);
  }

  getSchedule(groupId: number): Observable<DashboardScheduleItem[]> {
    return this.http.get<DashboardScheduleItem[]>(`${this.schedulesApi}/group/${groupId}`);
  }

  getNotifications(): Observable<DashboardNotification[]> {
    return this.http.get<DashboardNotification[]>(`${this.notificationsApi}/my-notifications`);
  }
}