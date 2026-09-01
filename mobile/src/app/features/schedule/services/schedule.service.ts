// schedule.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export type ScheduleDay = 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY' | 'SUNDAY';

export interface SchedulePersonUser {
  firstName: string;
  lastName: string;
}

export interface ScheduleTeacher {
  id: number;
  user?: SchedulePersonUser | null;
}

export interface ScheduleSubject {
  id: number;
  name: string;
  teacher?: ScheduleTeacher | null;
}

export interface ScheduleGroup {
  id: number;
  name: string;
}

export interface ScheduleClassroom {
  id: number;
  name: string;
}

export interface ScheduleClass {
  id: number;
  subject?: ScheduleSubject | null;
  teacher?: ScheduleTeacher | null;
  group?: ScheduleGroup | null;
  classroom?: ScheduleClassroom | null;
}

export interface ScheduleItem {
  id: number;
  classId: number;
  classroomId?: number | null;
  dayOfWeek: ScheduleDay;
  startTime: string;
  endTime: string;
  class: ScheduleClass;
  classroom?: ScheduleClassroom | null;
}

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/schedules`;

  getStudentSchedule(studentId: number): Observable<ScheduleItem[]> {
    return this.http.get<ScheduleItem[]>(`${this.api}/student/${studentId}`);
  }

  getTeacherSchedule(teacherId: number): Observable<ScheduleItem[]> {
    return this.http.get<ScheduleItem[]>(`${this.api}/teacher/${teacherId}`);
  }
}