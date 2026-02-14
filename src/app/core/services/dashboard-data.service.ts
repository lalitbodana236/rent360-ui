import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserRole, AuthService } from './auth.service';
import { ApiClientService } from './api-client.service';
import { environment } from '../../../environments/environment';
import { MOCK_PROPERTIES_STORE_KEY } from '../constants/mock-storage-keys';

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

interface PropertyUnitRecord {
  id: string;
  unitCode: string;
  rent: number;
  occupancyStatus: 'occupied' | 'vacant' | 'maintenance';
  tenantName: string;
}

interface PropertyRecord {
  id: string;
  name: string;
  ownerName: string;
  status: 'active' | 'inactive';
  units: PropertyUnitRecord[];
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
  constructor(
    private readonly apiClient: ApiClientService,
    private readonly auth: AuthService,
  ) {}

  getOverviewByRole(role: UserRole): Observable<DashboardOverview> {
    const persona = this.toPersona(role);
    const fileKey = this.personaToFileKey(persona);

    return this.apiClient
      .get<DashboardOverview>({
        endpoint: `dashboard/overview/${fileKey}`,
        mockPath: `dashboard/overview-${fileKey}.json`,
      })
      .pipe(
        map((data) => ({ ...data, role: persona })),
        map((overview) => this.linkPropertiesData(overview, persona)),
      );
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

  private linkPropertiesData(
    overview: DashboardOverview,
    persona: DashboardPersona,
  ): DashboardOverview {
    const allProperties = this.readPropertiesFromMockStore();
    if (!allProperties.length) {
      return overview;
    }

    const currentUser = this.auth.snapshotUser;
    const userName = (currentUser?.fullName ?? '').trim().toLowerCase();

    let scopedProperties = allProperties;
    if (persona === 'owner' && userName) {
      scopedProperties = allProperties.filter((p) =>
        p.ownerName
          .toLowerCase()
          .split(',')
          .map((x) => x.trim())
          .includes(userName),
      );
      if (!scopedProperties.length) {
        scopedProperties = allProperties;
      }
    }

    const allUnits = scopedProperties.flatMap((p) => p.units ?? []);

    const scopedOccupiedUnits =
      persona === 'tenant' && userName
        ? allUnits.filter((u) => u.tenantName?.toLowerCase() === userName)
        : allUnits.filter((u) => u.occupancyStatus === 'occupied');

    const activeProperties = scopedProperties.filter((p) => p.status === 'active');
    const activeTenants = scopedOccupiedUnits.filter((u) => !!u.tenantName).length;
    const estimatedRent = scopedOccupiedUnits.reduce((sum, u) => sum + (u.rent || 0), 0);
    const collectedRent = estimatedRent * 0.86;
    const outstandingRent = estimatedRent * 0.14;

    if (persona === 'owner') {
      overview.kpis = overview.kpis.map((kpi) => {
        const label = kpi.label.toLowerCase();
        if (label.includes('total properties')) {
          return { ...kpi, value: String(activeProperties.length) };
        }
        if (label.includes('active tenants')) {
          return { ...kpi, value: String(activeTenants) };
        }
        if (label.includes('rent collected')) {
          return { ...kpi, value: this.toMoney(collectedRent) };
        }
        if (label.includes('outstanding')) {
          return { ...kpi, value: this.toMoney(outstandingRent) };
        }
        return kpi;
      });
      return overview;
    }

    if (persona === 'tenant') {
      const currentRent = scopedOccupiedUnits.reduce((sum, u) => sum + (u.rent || 0), 0);
      const maintenanceDue = currentRent * 0.07;
      const outstanding = currentRent * 0.2;

      overview.kpis = overview.kpis.map((kpi) => {
        const label = kpi.label.toLowerCase();
        if (label.includes('current rent')) {
          return { ...kpi, value: this.toMoney(currentRent) };
        }
        if (label.includes('maintenance due')) {
          return { ...kpi, value: this.toMoney(maintenanceDue) };
        }
        if (label.includes('outstanding')) {
          return { ...kpi, value: this.toMoney(outstanding) };
        }
        if (label.includes('open requests')) {
          const open = scopedOccupiedUnits.length ? Math.max(1, scopedOccupiedUnits.length) : 0;
          return { ...kpi, value: String(open) };
        }
        return kpi;
      });

      return overview;
    }

    if (persona === 'societyAdmin') {
      const owners = this.unique(
        scopedProperties
          .map((p) => p.ownerName)
          .flatMap((n) => n.split(','))
          .map((n) => n.trim())
          .filter(Boolean),
      );
      const tenants = this.unique(
        allUnits.map((u) => u.tenantName).filter((n) => !!n),
      );

      overview.kpis = overview.kpis.map((kpi) => {
        const label = kpi.label.toLowerCase();
        if (label.includes('managed buildings')) {
          return { ...kpi, value: String(activeProperties.length) };
        }
        if (label.includes('defaulter accounts')) {
          return {
            ...kpi,
            value: String(allUnits.filter((u) => u.occupancyStatus !== 'occupied').length),
          };
        }
        return kpi;
      });

      if (overview.adminView) {
        overview.adminView.ownerInsights = overview.adminView.ownerInsights.map((item) => {
          const label = item.label.toLowerCase();
          if (label.includes('total owners')) {
            return { ...item, value: String(owners.length) };
          }
          if (label.includes('multi-home owners')) {
            const byOwner = new Map<string, number>();
            scopedProperties.forEach((p) => {
              const keys = p.ownerName
                .split(',')
                .map((n) => n.trim())
                .filter(Boolean);
              keys.forEach((key) => byOwner.set(key, (byOwner.get(key) ?? 0) + 1));
            });
            const count = [...byOwner.values()].filter((v) => v > 1).length;
            return { ...item, value: String(count) };
          }
          return item;
        });

        overview.adminView.tenantInsights = overview.adminView.tenantInsights.map((item) => {
          const label = item.label.toLowerCase();
          if (label.includes('active tenants')) {
            return { ...item, value: String(tenants.length) };
          }
          return item;
        });
      }
    }

    return overview;
  }

  private readPropertiesFromMockStore(): PropertyRecord[] {
    if (!environment.api.useMockApi) {
      return [];
    }

    try {
      const raw = localStorage.getItem(MOCK_PROPERTIES_STORE_KEY);
      if (!raw) {
        return [];
      }
      const parsed = JSON.parse(raw) as PropertyRecord[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private unique(values: string[]): string[] {
    return Array.from(new Set(values));
  }

  private toMoney(value: number): string {
    return `$${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
}
