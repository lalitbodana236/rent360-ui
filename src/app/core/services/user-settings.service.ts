import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiClientService } from './api-client.service';

export interface UserSettings {
  fullName: string;
  email: string;
  mobileNumber: string;
  address: string;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED';
  defaultDashboard: 'owner' | 'tenant';
}

interface SettingsRecord extends UserSettings {}

interface UserSettingsResponse {
  preferences: SettingsRecord[];
}

const DEFAULT_SETTINGS: UserSettings = {
  fullName: 'Olivia Owner',
  email: 'owner@rent360.com',
  mobileNumber: '+1 555-1234',
  address: '10 Main Street',
  currency: 'USD',
  defaultDashboard: 'owner',
};

@Injectable()
export class UserSettingsService {
  private readonly subject = new BehaviorSubject<UserSettings>(DEFAULT_SETTINGS);
  readonly userSettings$ = this.subject.asObservable();

  constructor(private readonly apiClient: ApiClientService) {}

  get snapshot(): UserSettings {
    return this.subject.value;
  }

  loadForUser(email: string): Observable<UserSettings> {
    return this.apiClient
      .get<UserSettingsResponse>({
        endpoint: 'users/preferences',
        mockPath: 'preferences/user-preferences.json',
      })
      .pipe(
        map((res) =>
          res.preferences.find((entry) => entry.email.toLowerCase() === email.toLowerCase()) ?? {
            ...DEFAULT_SETTINGS,
            email,
          },
        ),
        tap((settings) => {
          this.subject.next({ ...this.subject.value, ...settings });
        }),
      );
  }

  updateSettings(settings: Partial<UserSettings>): void {
    this.subject.next({ ...this.subject.value, ...settings });
  }
}
