// auth.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';
import { User } from '@core/auth/models/user';

export interface AuthLoginResponse {
  accessToken: string;
  user?: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/auth`;

  login(email: string, password: string): Observable<AuthLoginResponse> {
    return this.http.post<AuthLoginResponse>(`${this.api}/login`, { email, password });
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.api}/profile`);
  }
}