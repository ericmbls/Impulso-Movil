import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export type AttendanceStatus =
  | 'PRESENT'
  | 'ABSENT'
  | 'LATE'
  | 'JUSTIFIED';

export interface QrScanRequest {
  qrToken: string;
  classScheduleId: number;
  scannedAt?: string;
}

export interface AttendanceStudent {
  id: number;
  enrollmentId?: string;
  user?: {
    firstName?: string;
    lastName?: string;
  } | null;
  group?: {
    id?: number;
    name?: string;
  } | null;
}

export interface AttendanceClass {
  id?: number;
  subject?: {
    id?: number;
    name?: string;
  } | null;
  teacher?: {
    id?: number;
    user?: {
      firstName?: string;
      lastName?: string;
    } | null;
  } | null;
  group?: {
    id?: number;
    name?: string;
  } | null;
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
  status: AttendanceStatus;
  qrToken?: string | null;
  notes?: string | null;
  createdAt?: string;
  student?: AttendanceStudent | null;
  classes?: (AttendanceClass & {
    schedules?: AttendanceSchedule[];
  }) | null;
  classSchedule?: AttendanceSchedule | null;
}

export interface StudentAttendanceStats {
  absences: number;
  totalClasses: number;
  attendanceRate: number;
  present?: number;
  late?: number;
  justified?: number;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/attendance`;

  scanQr(
    qrToken: string,
    classScheduleId: number,
    scannedAt?: string,
  ): Observable<AttendanceScanResponse> {
    const body: QrScanRequest = {
      qrToken,
      classScheduleId,
    };
    if (scannedAt) {
      body.scannedAt = scannedAt;
    }
    return this.http.post<AttendanceScanResponse>(
      `${this.apiUrl}/scan-qr`,
      body,
    );
  }

  getByClassSchedule(
    classScheduleId: number,
  ): Observable<AttendanceScanResponse[]> {
    const params = new HttpParams().set(
      'classScheduleId',
      classScheduleId.toString(),
    );
    return this.http.get<AttendanceScanResponse[]>(
      this.apiUrl,
      { params },
    );
  }

  getByStudent(
    studentId: number,
  ): Observable<AttendanceScanResponse[]> {
    return this.http.get<AttendanceScanResponse[]>(
      `${this.apiUrl}/student/${studentId}`,
    );
  }

  getStudentStats(
    studentId: number,
  ): Observable<StudentAttendanceStats> {
    return this.http.get<StudentAttendanceStats>(
      `${this.apiUrl}/stats/student/${studentId}`,
    );
  }
}