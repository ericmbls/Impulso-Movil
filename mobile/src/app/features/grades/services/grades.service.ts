import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '@env/environment';

export interface GradeItem {
  id: number;
  studentId: number;
  subjectId: number;
  partial1?: number | null;
  partial2?: number | null;
  partial3?: number | null;
  finalGrade?: number | null;
  status: 'EXCELLENT' | 'REGULAR' | 'IRREGULAR' | string;
  period: string;
  createdAt?: string;
  updatedAt?: string;

  subject?: {
    id: number;
    name: string;

    teacher?: {
      id?: number;

      user?: {
        firstName?: string;
        lastName?: string;
      };
    };
  };
}

@Injectable({
  providedIn: 'root',
})
export class GradesService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/grades`;

  getByStudent(studentId: number): Observable<GradeItem[]> {
    return this.http.get<GradeItem[]>(
      `${this.apiUrl}/student/${studentId}`
    );
  }
}