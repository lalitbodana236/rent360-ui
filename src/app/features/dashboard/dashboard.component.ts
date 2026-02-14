import { Component, OnInit } from '@angular/core';
import { DashboardDataService, DashboardOverview } from '../../core/services/dashboard-data.service';
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
  ) {}

  ngOnInit(): void {
    this.settings.userSettings$.subscribe((user) => {
      this.userName = user.fullName;
    });

    this.dashboardData.getOwnerOverview().subscribe((res) => {
      this.data = res;
    });
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
}
