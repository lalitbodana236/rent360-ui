import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole } from './auth.service';
import { ApiClientService } from './api-client.service';

export interface DashboardOverview {
  role: UserRole;
  kpis: { label: string; value: string }[];
  collectionHealth: {
    label: string;
    percent: number;
    tone: 'success' | 'info' | 'warning' | 'danger';
  }[];
  charges: {
    amount: string;
    property: string;
    unit: string;
    description: string;
    status: 'Paid' | 'Late' | 'Due';
    action: string;
  }[];
}

@Injectable()
export class DashboardDataService {
  constructor(private readonly apiClient: ApiClientService) {}

  getOverviewByRole(role: UserRole): Observable<DashboardOverview> {
    const normalizedRole = role === 'tenant' ? 'tenant' : 'owner';

    return this.apiClient
      .get<DashboardOverview>({
        endpoint: `dashboard/overview/${normalizedRole}`,
        mockPath: `dashboard/overview-${normalizedRole}.json`,
      })
      .pipe(map((data) => ({ ...data, role: normalizedRole })));
  }
}
