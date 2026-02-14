import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { ApiClientService } from './services/api-client.service';
import { FeatureFlagsService } from './services/feature-flags.service';
import { UserSettingsService } from './services/user-settings.service';
import { DashboardDataService } from './services/dashboard-data.service';
import { ThemeService } from './services/theme.service';

@NgModule({
  imports: [CommonModule],
  providers: [
    AuthGuard,
    AuthService,
    ApiClientService,
    FeatureFlagsService,
    UserSettingsService,
    DashboardDataService,
    ThemeService,
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import only in AppModule.');
    }
  }
}
