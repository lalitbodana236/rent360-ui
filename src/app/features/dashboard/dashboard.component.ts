import { Component, OnInit } from '@angular/core';
import { DashboardDataService, DashboardOverview } from '../../core/services/dashboard-data.service';
import { AuthService, UserRole } from '../../core/services/auth.service';
import { UserSettingsService } from '../../core/services/user-settings.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  data: DashboardOverview | null = null;
  userName = 'User';

  constructor(
    private readonly dashboardData: DashboardDataService,
    private readonly settings: UserSettingsService,
    private readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.settings.userSettings$.subscribe((user) => {
      this.userName = user.fullName;
    });

    const role = this.resolveRole();
    this.dashboardData.getOverviewByRole(role).subscribe((res) => {
      this.data = res;
    });
  }

  get viewLabel(): string {
    return this.data?.role === 'tenant' ? 'Tenant View' : 'Owner View';
  }

  get chargesTitle(): string {
    return this.data?.role === 'tenant' ? 'Your Charges' : 'Owner Charges';
  }

  widthClass(percent: number): string {
    if (percent >= 90) return 'w-[90%]';
    if (percent >= 80) return 'w-[80%]';
    if (percent >= 70) return 'w-[70%]';
    if (percent >= 60) return 'w-[60%]';
    if (percent >= 50) return 'w-[50%]';
    if (percent >= 40) return 'w-[40%]';
    if (percent >= 30) return 'w-[30%]';
    if (percent >= 20) return 'w-[20%]';
    if (percent >= 10) return 'w-[10%]';
    return 'w-[5%]';
  }

  private resolveRole(): UserRole {
    if (this.auth.hasRole('tenant')) {
      return 'tenant';
    }
    if (this.auth.hasRole('owner')) {
      return 'owner';
    }
    return 'owner';
  }
}
