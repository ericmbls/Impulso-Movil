import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

export interface StudentQr {

  qrToken: string | null;

  qrImage: string | null;

  expiresAt: string | null;

  isValid: boolean;

}

@Injectable({
  providedIn: 'root'
})
export class QrService {

  private readonly api = `${environment.apiUrl}/qr`;

  constructor(
    private http: HttpClient
  ) {}

  getMyQr(): Observable<StudentQr> {

    return this.http.get<StudentQr>(`${this.api}/my-qr`);

  }

  refreshQr(): Observable<StudentQr> {

    return this.http.post<StudentQr>(
      `${this.api}/refresh`,
      {}
    );

  }

}