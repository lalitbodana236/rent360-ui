import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from './api-client.service';
import { UserRole, AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { MOCK_PROPERTIES_STORE_KEY } from '../constants/mock-storage-keys';

export interface MarketplaceSummary {
  activeListings: number;
  monthlyLeads: number;
  conversionRate: number;
  vacancyImpactPercent: number;
}

interface PropertyRecord {
  name: string;
  ownerName: string;
  status: 'active' | 'inactive';
  units: { occupancyStatus: 'occupied' | 'vacant' | 'maintenance' }[];
}

@Injectable()
export class MarketplaceDataService {
  constructor(
    private readonly apiClient: ApiClientService,
    private readonly auth: AuthService,
  ) {}

  getSummary(role: UserRole): Observable<MarketplaceSummary> {
    const fileKey = this.toFileKey(role);
    return this.apiClient
      .get<MarketplaceSummary>({
        endpoint: `marketplace/summary/${fileKey}`,
        mockPath: `marketplace/summary-${fileKey}.json`,
      })
      .pipe(map((summary) => this.linkProperties(summary, role)));
  }

  private toFileKey(role: UserRole): string {
    if (role === 'tenant') {
      return 'tenant';
    }
    if (role === 'societyAdmin') {
      return 'society-admin';
    }
    return 'owner';
  }

  private linkProperties(
    summary: MarketplaceSummary,
    role: UserRole,
  ): MarketplaceSummary {
    if (!environment.api.useMockApi) {
      return summary;
    }

    const properties = this.readPropertiesStore();
    if (!properties.length) {
      return summary;
    }

    const currentUser = this.auth.snapshotUser;
    const userName = (currentUser?.fullName ?? '').trim().toLowerCase();

    let scoped = properties;
    if (role === 'owner' && userName) {
      scoped = properties.filter((p) =>
        p.ownerName
          .toLowerCase()
          .split(',')
          .map((x) => x.trim())
          .includes(userName),
      );
      if (!scoped.length) {
        scoped = properties;
      }
    }

    const activeListings = scoped.filter((p) => p.status === 'active').length;
    const totalUnits = scoped.flatMap((p) => p.units).length;
    const vacantUnits = scoped
      .flatMap((p) => p.units)
      .filter((u) => u.occupancyStatus === 'vacant').length;

    const monthlyLeads = Math.max(8, activeListings * 6 + totalUnits * 2);
    const conversionRate = Math.max(8, Math.min(45, 28 - vacantUnits));
    const vacancyImpactPercent =
      totalUnits > 0 ? Math.round((vacantUnits / totalUnits) * 100) : 0;

    return {
      activeListings,
      monthlyLeads,
      conversionRate,
      vacancyImpactPercent,
    };
  }

  private readPropertiesStore(): PropertyRecord[] {
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
}
