import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export interface ScheduleItem {
  id: number;
  classId: number;
  classroomId?: number | null;
  dayOfWeek: string;
  startTime: string;
  endTime: string;

  class: {
    id: number;

    subject?: {
      id: number;
      name: string;
    };

    teacher?: {
      id: number;
      user?: {
        firstName: string;
        lastName: string;
      };
    };

    group?: {
      id: number;
      name: string;
    };

    classroom?: {
      id: number;
      name: string;
    } | null;
  };

  classroom?: {
    id: number;
    name: string;
  } | null;
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private readonly http = inject(HttpClient);

  private readonly api = `${environment.apiUrl}/schedules`;

  getStudentSchedule(
    studentId: number,
  ): Observable<ScheduleItem[]> {
    return this.http.get<ScheduleItem[]>(
      `${this.api}/student/${studentId}`,
    );
  }

  getTeacherSchedule(
    teacherId: number,
  ): Observable<ScheduleItem[]> {
    return this.http.get<ScheduleItem[]>(
      `${this.api}/teacher/${teacherId}`,
    );
  }
}