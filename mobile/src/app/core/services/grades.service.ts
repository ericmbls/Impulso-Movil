import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GradesService {

  private http = inject(HttpClient);

  private readonly api = `${environment.apiUrl}/grades`;

  getStudentGrades(studentId: number) {
    return this.http.get(`${this.api}/student/${studentId}`);
  }

}