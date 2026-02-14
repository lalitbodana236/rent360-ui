import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  DashboardDataService,
  DashboardOverview,
  DashboardPersona,
} from '../../core/services/dashboard-data.service';
import { AuthService, UserRole } from '../../core/services/auth.service';
import { UserSettingsService } from '../../core/services/user-settings.service';
import {
  PlatformInsight,
  PlatformInsightsService,
} from '../../core/services/platform-insights.service';
import { DataRefreshService } from '../../core/services/data-refresh.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  data: DashboardOverview | null = null;
  insights: PlatformInsight[] = [];
  userName = 'User';
  private baseData: DashboardOverview | null = null;
  private readonly subscriptions = new Subscription();

  availablePersonas: DashboardPersona[] = [];
  selectedPersona: DashboardPersona = 'owner';

  viewMode: 'monthly' | 'yearly' = 'monthly';
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();
  readonly yearOptions = [2024, 2025, 2026, 2027];
  readonly monthOptions = [
    { value: 1, label: 'Jan' },
    { value: 2, label: 'Feb' },
    { value: 3, label: 'Mar' },
    { value: 4, label: 'Apr' },
    { value: 5, label: 'May' },
    { value: 6, label: 'Jun' },
    { value: 7, label: 'Jul' },
    { value: 8, label: 'Aug' },
    { value: 9, label: 'Sep' },
    { value: 10, label: 'Oct' },
    { value: 11, label: 'Nov' },
    { value: 12, label: 'Dec' },
  ];

  constructor(
    private readonly dashboardData: DashboardDataService,
    private readonly settings: UserSettingsService,
    private readonly auth: AuthService,
    private readonly platformInsights: PlatformInsightsService,
    private readonly refresh: DataRefreshService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.settings.userSettings$.subscribe((user) => {
        this.userName = user.fullName;
      }),
    );

    this.initializePersonas();
    this.loadPersona(this.selectedPersona);

    this.subscriptions.add(
      this.refresh.propertiesChanged$.subscribe(() => {
        this.loadPersona(this.selectedPersona);
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get viewLabel(): string {
    if (this.selectedPersona === 'tenant') {
      return 'Tenant View';
    }
    if (this.selectedPersona === 'societyAdmin') {
      return 'Society Admin View';
    }
    return 'Owner View';
  }

  get chargesTitle(): string {
    if (this.selectedPersona === 'tenant') {
      return 'Your Charges';
    }
    if (this.selectedPersona === 'societyAdmin') {
      return 'Society Billing';
    }
    return 'Owner Charges';
  }

  personaLabel(persona: DashboardPersona): string {
    if (persona === 'tenant') {
      return 'Tenant';
    }
    if (persona === 'societyAdmin') {
      return 'Society Admin';
    }
    return 'Owner';
  }

  selectPersona(persona: DashboardPersona): void {
    if (this.selectedPersona === persona) {
      return;
    }
    this.selectedPersona = persona;
    this.loadPersona(persona);
  }

  changeViewMode(mode: 'monthly' | 'yearly'): void {
    this.viewMode = mode;
    this.applyPeriodFilter();
  }

  changeMonth(value: string): void {
    this.selectedMonth = Number(value);
    this.applyPeriodFilter();
  }

  changeYear(value: string): void {
    this.selectedYear = Number(value);
    this.applyPeriodFilter();
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

  private initializePersonas(): void {
    const roles = this.auth.snapshotUser?.roles ?? [];
    const personas: DashboardPersona[] = [];

    if (roles.includes('owner')) {
      personas.push('owner');
    }
    if (roles.includes('tenant')) {
      personas.push('tenant');
    }
    if (roles.includes('societyAdmin')) {
      personas.push('societyAdmin');
    }

    this.availablePersonas = personas.length ? personas : ['owner'];

    const preferred = this.settings.snapshot.defaultDashboard;
    if (preferred === 'tenant' && this.availablePersonas.includes('tenant')) {
      this.selectedPersona = 'tenant';
    } else {
      this.selectedPersona = this.availablePersonas[0];
    }
  }

  private loadPersona(persona: DashboardPersona): void {
    const asUserRole = persona as UserRole;

    this.dashboardData.getOverviewByRole(asUserRole).subscribe((res) => {
      this.baseData = res;
      this.applyPeriodFilter();
    });

    this.platformInsights.getInsights(asUserRole).subscribe((items) => {
      this.insights = items;
    });
  }

  private applyPeriodFilter(): void {
    if (!this.baseData) {
      return;
    }

    const source = this.deepClone(this.baseData);
    const monthFactor = this.getMonthFactor(this.selectedMonth);
    const yearFactor = this.getYearFactor(this.selectedYear);
    const monetaryFactor =
      this.viewMode === 'yearly' ? yearFactor * 12 : monthFactor * yearFactor;
    const countFactor =
      this.viewMode === 'yearly' ? Math.max(1, yearFactor * 12) : monthFactor * yearFactor;

    source.kpis = source.kpis.map((item) => ({
      ...item,
      value: this.scaleValue(item.value, monetaryFactor, countFactor),
    }));

    source.charges = source.charges.map((row) => ({
      ...row,
      amount: this.scaleMoney(row.amount, monetaryFactor),
    }));

    source.collectionHealth = source.collectionHealth.map((row) => {
      const baseShift = Math.round((monthFactor - 1) * 20 + (yearFactor - 1) * 12);
      const signedShift =
        row.tone === 'warning' || row.tone === 'danger' ? -baseShift : baseShift;
      return {
        ...row,
        percent: this.clampPercent(row.percent + signedShift),
      };
    });

    if (source.adminView) {
      source.adminView.ownerInsights = source.adminView.ownerInsights.map((item) => ({
        ...item,
        value: this.scaleValue(item.value, monetaryFactor, countFactor),
      }));

      source.adminView.tenantInsights = source.adminView.tenantInsights.map((item) => ({
        ...item,
        value: this.scaleValue(item.value, monetaryFactor, countFactor),
      }));

      source.adminView.operationsInsights = source.adminView.operationsInsights.map((item) => ({
        ...item,
        value: this.scaleValue(item.value, monetaryFactor, countFactor),
      }));

      source.adminView.defaulters = source.adminView.defaulters.map((row) => ({
        ...row,
        rentDue: this.scaleMoney(row.rentDue, monetaryFactor),
        maintenanceDue: this.scaleMoney(row.maintenanceDue, monetaryFactor),
        daysLate:
          this.viewMode === 'yearly' ? Math.min(365, row.daysLate * 4) : row.daysLate,
      }));
    }

    this.data = source;
  }

  private scaleValue(value: string, moneyFactor: number, countFactor: number): string {
    if (value.includes('$')) {
      return this.scaleMoney(value, moneyFactor);
    }

    const numeric = this.extractNumber(value);
    if (numeric === null) {
      return value;
    }

    const scaled =
      this.viewMode === 'yearly'
        ? Math.round(numeric * countFactor)
        : Math.max(0, Math.round(numeric * countFactor));

    return scaled.toLocaleString();
  }

  private scaleMoney(value: string, factor: number): string {
    const numeric = this.extractNumber(value);
    if (numeric === null) {
      return value;
    }

    return `$${(numeric * factor).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  private extractNumber(value: string): number | null {
    const parsed = Number(value.replace(/[^0-9.-]+/g, ''));
    return Number.isFinite(parsed) ? parsed : null;
  }

  private clampPercent(value: number): number {
    return Math.min(98, Math.max(3, value));
  }

  private getMonthFactor(month: number): number {
    const factors: Record<number, number> = {
      1: 0.92,
      2: 0.94,
      3: 0.97,
      4: 0.99,
      5: 1.01,
      6: 1.03,
      7: 1.05,
      8: 1.04,
      9: 1.02,
      10: 1.01,
      11: 0.98,
      12: 0.95,
    };
    return factors[month] ?? 1;
  }

  private getYearFactor(year: number): number {
    if (year <= 2024) {
      return 0.9;
    }
    if (year === 2025) {
      return 0.96;
    }
    if (year === 2026) {
      return 1;
    }
    return 1.08;
  }

  private deepClone<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T;
  }
}
