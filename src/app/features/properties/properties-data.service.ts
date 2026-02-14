import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiClientService } from '../../core/services/api-client.service';
import { MOCK_PROPERTIES_STORE_KEY } from '../../core/constants/mock-storage-keys';
import { DataRefreshService } from '../../core/services/data-refresh.service';

export type PropertyStatus = 'active' | 'inactive';
export type UnitOccupancyStatus = 'occupied' | 'vacant' | 'maintenance';

export interface UnitRecord {
  id: string;
  unitCode: string;
  type: string;
  rent: number;
  occupancyStatus: UnitOccupancyStatus;
  tenantName: string;
}

export interface PropertyRecord {
  id: string;
  name: string;
  city: string;
  ownerName: string;
  status: PropertyStatus;
  units: UnitRecord[];
}

interface PropertiesApiResponse {
  properties: PropertyRecord[];
}

export interface PropertyCreatePayload {
  name: string;
  city: string;
  ownerName: string;
  status: PropertyStatus;
}

export interface PropertyUpdatePayload extends PropertyCreatePayload {
  id: string;
}

@Injectable({ providedIn: 'root' })
export class PropertiesDataService {
  private readonly mockStoreKey = MOCK_PROPERTIES_STORE_KEY;
  private readonly state$ = new BehaviorSubject<PropertyRecord[]>([]);
  private initialized = false;

  constructor(
    private readonly apiClient: ApiClientService,
    private readonly refresh: DataRefreshService,
  ) {}

  getProperties(): Observable<PropertyRecord[]> {
    if (this.initialized) {
      return this.state$.asObservable();
    }

    if (environment.api.useMockApi) {
      const saved = this.readMockStore();
      if (saved) {
        this.initialized = true;
        this.state$.next(saved);
        return this.state$.asObservable();
      }
    }

    return this.apiClient
      .get<PropertiesApiResponse>({
        endpoint: 'properties/units',
        mockPath: 'properties/units.json',
      })
      .pipe(
        map((res) => res.properties ?? []),
        tap((rows) => {
          this.initialized = true;
          this.state$.next(rows);
          this.writeMockStore(rows);
          this.refresh.notifyPropertiesChanged();
        }),
        map(() => this.state$.value),
      );
  }

  createProperty(payload: PropertyCreatePayload): Observable<PropertyRecord> {
    if (!environment.api.useMockApi) {
      return this.apiClient.post<PropertyRecord>('properties', payload);
    }

    const created: PropertyRecord = {
      id: this.makeId('prop'),
      name: payload.name.trim(),
      city: payload.city.trim(),
      ownerName: payload.ownerName.trim(),
      status: payload.status,
      units: [],
    };

    const next = [created, ...this.state$.value];
    this.state$.next(next);
    this.writeMockStore(next);
    this.refresh.notifyPropertiesChanged();
    return of(created);
  }

  updateProperty(payload: PropertyUpdatePayload): Observable<PropertyRecord> {
    if (!environment.api.useMockApi) {
      return this.apiClient.put<PropertyRecord>(`properties/${payload.id}`, payload);
    }

    let updated: PropertyRecord | undefined;
    const next = this.state$.value.map((item) => {
      if (item.id !== payload.id) {
        return item;
      }

      updated = {
        ...item,
        name: payload.name.trim(),
        city: payload.city.trim(),
        ownerName: payload.ownerName.trim(),
        status: payload.status,
      };

      return updated;
    });

    if (updated === undefined) {
      throw new Error('Property not found for update.');
    }

    this.state$.next(next);
    this.writeMockStore(next);
    this.refresh.notifyPropertiesChanged();
    return of(updated);
  }

  private makeId(prefix: string): string {
    return `${prefix}-${Date.now()}`;
  }

  private readMockStore(): PropertyRecord[] | null {
    try {
      const raw = localStorage.getItem(this.mockStoreKey);
      if (!raw) {
        return null;
      }
      const parsed = JSON.parse(raw) as PropertyRecord[];
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private writeMockStore(value: PropertyRecord[]): void {
    if (!environment.api.useMockApi) {
      return;
    }

    try {
      localStorage.setItem(this.mockStoreKey, JSON.stringify(value));
    } catch {
      // Ignore storage quota and private-mode errors.
    }
  }
}
