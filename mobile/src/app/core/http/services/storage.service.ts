import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  private readonly TOKEN_KEY = 'access_token';
  private readonly USER_KEY = 'user';

  async saveToken(token: string): Promise<void> {

    await Preferences.set({
      key: this.TOKEN_KEY,
      value: token
    });

  }

  async getToken(): Promise<string |null> {

    const { value } = await Preferences.get({
      key: this.TOKEN_KEY
    });

    return value;

  }

  async removeToken(): Promise<void> {

    await Preferences.remove({
      key: this.TOKEN_KEY
    });

  }

  async saveUser(user: unknown): Promise<void> {

    await Preferences.set({
      key: this.USER_KEY,
      value: JSON.stringify(user)
    });

  }

  async getUser<T>(): Promise<T | null> {

    const { value } = await Preferences.get({
      key: this.USER_KEY
    });

    return value ? JSON.parse(value) as T : null;

  }

  async removeUser(): Promise<void> {

    await Preferences.remove({
      key: this.USER_KEY
    });

  }

  async clear(): Promise<void> {

    await this.removeToken();
    await this.removeUser();

  }

  async isLoggedIn(): Promise<boolean> {

    return !!(await this.getToken());

  }

}