// grades.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

export type GradeStatus = 'EXCELLENT' | 'REGULAR' | 'IRREGULAR';

export interface GradeTeacherUser { firstName?: string; lastName?: string; }
export interface GradeTeacher { id?: number; user?: GradeTeacherUser | null; }
export interface GradeSubject { id: number; name: string; teacher?: GradeTeacher | null; }

export interface GradeItem {
  id: number;
  studentId: number;
  subjectId: number;
  partial1?: number | null;
  partial2?: number | null;
  partial3?: number | null;
  finalGrade?: number | null;
  status: GradeStatus;
  period: string;
  createdAt?: string;
  updatedAt?: string;
  subject?: GradeSubject | null;
}

@Injectable({ providedIn: 'root' })
export class GradesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/grades`;

  getByStudent(studentId: number): Observable<GradeItem[]> {
    return this.http.get<GradeItem[]>(`${this.apiUrl}/student/${studentId}`);
  }
}