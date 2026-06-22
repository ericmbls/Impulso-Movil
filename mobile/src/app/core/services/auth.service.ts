import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);

  private readonly api = `${environment.apiUrl}/auth`;

  login(email: string, password: string) {

    return this.http.post(`${this.api}/login`, {
      email,
      password
    });

  }

  getProfile() {

    return this.http.get(`${this.api}/profile`);

  }

}