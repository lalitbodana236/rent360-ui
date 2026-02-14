import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole } from './auth.service';
import { ApiClientService } from './api-client.service';

export type DashboardPersona = 'owner' | 'tenant' | 'societyAdmin';

interface DirectoryRow {
  name: string;
  role: string;
  property: string;
  unit: string;
  status: string;
}

interface DefaulterRow {
  name: string;
  property: string;
  unit: string;
  rentDue: string;
  maintenanceDue: string;
  daysLate: number;
}

interface HistoryRow {
  name: string;
  role: string;
  property: string;
  unit: string;
  from: string;
  to: string;
  moveOutReason: string;
}

export interface DashboardOverview {
  role: DashboardPersona;
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
  adminView?: {
    ownerInsights: { label: string; value: string }[];
    tenantInsights: { label: string; value: string }[];
    operationsInsights: { label: string; value: string }[];
    directory: DirectoryRow[];
    defaulters: DefaulterRow[];
    history: HistoryRow[];
  };
}

@Injectable()
export class DashboardDataService {
  constructor(private readonly apiClient: ApiClientService) {}

  getOverviewByRole(role: UserRole): Observable<DashboardOverview> {
    const persona = this.toPersona(role);
    const fileKey = this.personaToFileKey(persona);

    return this.apiClient
      .get<DashboardOverview>({
        endpoint: `dashboard/overview/${fileKey}`,
        mockPath: `dashboard/overview-${fileKey}.json`,
      })
      .pipe(map((data) => ({ ...data, role: persona })));
  }

  private toPersona(role: UserRole): DashboardPersona {
    if (role === 'tenant') {
      return 'tenant';
    }
    if (role === 'societyAdmin') {
      return 'societyAdmin';
    }
    return 'owner';
  }

  private personaToFileKey(persona: DashboardPersona): string {
    if (persona === 'societyAdmin') {
      return 'society-admin';
    }
    return persona;
  }
}
