import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class GradesService {

  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/grades`;

  getStudentGrades(studentId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/student/${studentId}`);
  }

}