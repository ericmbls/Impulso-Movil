import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private readonly gradesApi = `${environment.apiUrl}/grades`;
  private readonly attendanceApi = `${environment.apiUrl}/attendance`;
  private readonly schedulesApi = `${environment.apiUrl}/schedules`;

  getGrades(studentId: number) {
    return this.http.get<any[]>(`${this.gradesApi}/student/${studentId}`);
  }

  getAttendanceStats(studentId: number) {
    return this.http.get<any>(`${this.attendanceApi}/stats/student/${studentId}`);
  }

  getSchedule(groupId: number) {
    return this.http.get<any[]>(`${this.schedulesApi}/group/${groupId}`);
  }
}