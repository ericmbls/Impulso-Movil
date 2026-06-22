import { Injectable, inject, signal } from '@angular/core';

import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {

  private storage = inject(StorageService);

  readonly user = signal<any | null>(null);

  async loadUser() {

    const user = await this.storage.getUser();

    if (user) {

      this.user.set(user);

    }

  }

  setUser(user: any) {

    this.user.set(user);

  }

  clear() {

    this.user.set(null);

  }

}