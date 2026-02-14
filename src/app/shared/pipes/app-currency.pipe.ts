import { Pipe, PipeTransform } from '@angular/core';
import { UserSettingsService } from '../../core/services/user-settings.service';

@Pipe({ name: 'appCurrency', pure: false })
export class AppCurrencyPipe implements PipeTransform {
  private currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED' = 'USD';

  constructor(private readonly settings: UserSettingsService) {
    this.settings.userSettings$.subscribe((user) => {
      this.currency = user.currency;
    });
  }

  transform(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: this.currency,
      maximumFractionDigits: 2,
    }).format(value);
  }
}
