import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface QrScanRequest {
  qrToken: string;
  classScheduleId: number;
}

export interface AttendanceStudent {
  id: number;
  enrollmentId?: string;
  user?: { firstName?: string; lastName?: string; };
  group?: { id?: number; name?: string; };
}

export interface AttendanceClass {
  id?: number;
  subject?: { id?: number; name?: string; };
  teacher?: { id?: number; user?: { firstName?: string; lastName?: string; }; };
  group?: { id?: number; name?: string; };
}

export interface AttendanceSchedule {
  id?: number;
  dayOfWeek?: string;
  startTime?: string;
  endTime?: string;
}

export interface AttendanceScanResponse {
  id: number;
  studentId: number;
  classId: number;
  classScheduleId: number;
  date: string;
  status: string;
  qrToken?: string | null;
  notes?: string | null;
  createdAt?: string;
  student?: AttendanceStudent;
  classes?: AttendanceClass & { schedules?: AttendanceSchedule[]; };
}

@Injectable({ providedIn: 'root' })
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/attendance`;

  scanQr(qrToken: string, classScheduleId: number): Observable<AttendanceScanResponse> {
    const body: QrScanRequest = { qrToken, classScheduleId };
    return this.http.post<AttendanceScanResponse>(`${this.apiUrl}/scan-qr`, body);
  }

  getByClassSchedule(classScheduleId: number): Observable<AttendanceScanResponse[]> {
    const params = new HttpParams().set('classScheduleId', classScheduleId.toString());
    return this.http.get<AttendanceScanResponse[]>(this.apiUrl, { params });
  }

  getByStudent(studentId: number): Observable<AttendanceScanResponse[]> {
    return this.http.get<AttendanceScanResponse[]>(`${this.apiUrl}/student/${studentId}`);
  }

  getStudentStats(studentId: number): Observable<{
    absences: number;
    totalClasses: number;
    attendanceRate: string;
  }> {
    return this.http.get<{
      absences: number;
      totalClasses: number;
      attendanceRate: string;
    }>(`${this.apiUrl}/stats/student/${studentId}`);
  }
}