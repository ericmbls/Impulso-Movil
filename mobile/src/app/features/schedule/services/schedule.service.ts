import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/schedules`;

  getStudentSchedule(studentId: number) {
    return this.http.get<any[]>(`${this.api}/student/${studentId}`);
  }

}