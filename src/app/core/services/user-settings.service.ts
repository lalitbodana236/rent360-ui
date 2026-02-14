import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface UserSettings {
  fullName: string;
  email: string;
  mobileNumber: string;
  address: string;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED';
}

const DEFAULT_SETTINGS: UserSettings = {
  fullName: 'Olivia Owner',
  email: 'owner@rent360.com',
  mobileNumber: '+1 555-1234',
  address: '10 Main Street',
  currency: 'USD',
};

@Injectable()
export class UserSettingsService {
  private readonly subject = new BehaviorSubject<UserSettings>(DEFAULT_SETTINGS);
  readonly userSettings$ = this.subject.asObservable();

  updateSettings(settings: Partial<UserSettings>): void {
    this.subject.next({ ...this.subject.value, ...settings });
  }
}
