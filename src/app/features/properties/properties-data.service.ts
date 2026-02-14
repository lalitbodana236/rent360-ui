import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiClientService } from '../../core/services/api-client.service';
import { MOCK_PROPERTIES_STORE_KEY } from '../../core/constants/mock-storage-keys';
import { DataRefreshService } from '../../core/services/data-refresh.service';
import { API_ENDPOINTS } from '../../core/constants/api-endpoints';

export type PropertyStatus = 'active' | 'inactive';
export type UnitOccupancyStatus = 'occupied' | 'vacant' | 'maintenance';
export type FurnishingType = 'furnished' | 'semi-furnished' | 'unfurnished';
export type BHKType = 'studio' | '1BHK' | '2BHK' | '3BHK' | '4BHK' | '5BHK+';

export interface UnitMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
}

export interface UnitParkingInfo {
  twoWheelerSlots: number;
  fourWheelerSlots: number;
}

export interface UnitUtilities {
  electricityProvider: string;
  meterNumber: string;
  gasLine: 'yes' | 'no';
  waterSupply: 'corporation' | 'borewell' | 'mixed';
}

export interface UnitRecord {
  id: string;
  unitCode: string;
  type: string;
  configuration: BHKType;
  furnishing: FurnishingType;
  rent: number;
  occupancyStatus: UnitOccupancyStatus;
  tenantName: string;
  carpetAreaSqFt: number;
  parking: UnitParkingInfo;
  utilities: UnitUtilities;
  media: UnitMedia[];
}

export interface PropertyRecord {
  id: string;
  name: string;
  city: string;
  address: string;
  description: string;
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
  address: string;
  description: string;
  ownerName: string;
  status: PropertyStatus;
}

export interface PropertyUpdatePayload extends PropertyCreatePayload {
  id: string;
}

export interface UnitUpsertPayload {
  id?: string;
  propertyId: string;
  unitCode: string;
  configuration: BHKType;
  furnishing: FurnishingType;
  rent: number;
  occupancyStatus: UnitOccupancyStatus;
  tenantName: string;
  carpetAreaSqFt: number;
  parking: UnitParkingInfo;
  utilities: UnitUtilities;
  media: UnitMedia[];
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
        this.state$.next(this.normalizeProperties(saved));
        return this.state$.asObservable();
      }
    }

    return this.apiClient
      .get<PropertiesApiResponse>({
        endpoint: API_ENDPOINTS.properties.list,
        mockPath: 'properties/units.json',
      })
      .pipe(
        map((res) => this.normalizeProperties(res.properties ?? [])),
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
      return this.apiClient.post<PropertyRecord>(API_ENDPOINTS.properties.create, payload);
    }

    if (this.isDuplicateProperty(payload)) {
      return throwError(() => new Error('Property already exists with same name and address.'));
    }

    const created: PropertyRecord = {
      id: this.makeId('prop'),
      name: payload.name.trim(),
      city: payload.city.trim(),
      address: payload.address.trim(),
      description: payload.description.trim(),
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
      return this.apiClient.put<PropertyRecord>(API_ENDPOINTS.properties.update(payload.id), payload);
    }

    if (this.isDuplicateProperty(payload, payload.id)) {
      return throwError(() => new Error('Another property already exists with same name and address.'));
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
        address: payload.address.trim(),
        description: payload.description.trim(),
        ownerName: payload.ownerName.trim(),
        status: payload.status,
      };

      return updated;
    });

    if (updated === undefined) {
      return throwError(() => new Error('Property not found for update.'));
    }

    this.state$.next(next);
    this.writeMockStore(next);
    this.refresh.notifyPropertiesChanged();
    return of(updated);
  }

  upsertUnit(payload: UnitUpsertPayload): Observable<UnitRecord> {
    if (!environment.api.useMockApi) {
      if (payload.id) {
        return this.apiClient.put<UnitRecord>(
          API_ENDPOINTS.properties.updateUnit(payload.propertyId, payload.id),
          payload,
        );
      }
      return this.apiClient.post<UnitRecord>(
        API_ENDPOINTS.properties.createUnit(payload.propertyId),
        payload,
      );
    }

    const property = this.state$.value.find((item) => item.id === payload.propertyId);
    if (!property) {
      return throwError(() => new Error('Property not found for unit operation.'));
    }

    if (this.isDuplicateUnitCode(property, payload.unitCode, payload.id)) {
      return throwError(() => new Error('Unit code already exists in this property.'));
    }

    const normalizedMedia = payload.media
      .filter((item) => item.url.trim().length > 0)
      .map((item) => ({ ...item, url: item.url.trim(), title: item.title.trim() }));

    const normalizedUnit: UnitRecord = {
      id: payload.id ?? this.makeId('unit'),
      unitCode: payload.unitCode.trim(),
      configuration: payload.configuration,
      type: payload.configuration,
      furnishing: payload.furnishing,
      rent: Number(payload.rent) || 0,
      occupancyStatus: payload.occupancyStatus,
      tenantName: payload.tenantName.trim(),
      carpetAreaSqFt: Number(payload.carpetAreaSqFt) || 0,
      parking: {
        twoWheelerSlots: Number(payload.parking.twoWheelerSlots) || 0,
        fourWheelerSlots: Number(payload.parking.fourWheelerSlots) || 0,
      },
      utilities: {
        electricityProvider: payload.utilities.electricityProvider.trim(),
        meterNumber: payload.utilities.meterNumber.trim(),
        gasLine: payload.utilities.gasLine,
        waterSupply: payload.utilities.waterSupply,
      },
      media: normalizedMedia,
    };

    const next = this.state$.value.map((currentProperty) => {
      if (currentProperty.id !== payload.propertyId) {
        return currentProperty;
      }

      const existingIndex = currentProperty.units.findIndex(
        (unit) => unit.id === normalizedUnit.id,
      );

      if (existingIndex === -1) {
        return { ...currentProperty, units: [...currentProperty.units, normalizedUnit] };
      }

      const units = [...currentProperty.units];
      units[existingIndex] = normalizedUnit;
      return { ...currentProperty, units };
    });

    this.state$.next(next);
    this.writeMockStore(next);
    this.refresh.notifyPropertiesChanged();
    return of(normalizedUnit);
  }

  private isDuplicateProperty(payload: PropertyCreatePayload, ignoreId = ''): boolean {
    const nameKey = this.norm(payload.name);
    const cityKey = this.norm(payload.city);
    const addressKey = this.norm(payload.address);

    return this.state$.value.some((item) => {
      if (ignoreId && item.id === ignoreId) {
        return false;
      }
      return (
        this.norm(item.name) === nameKey &&
        this.norm(item.city) === cityKey &&
        this.norm(item.address) === addressKey
      );
    });
  }

  private isDuplicateUnitCode(
    property: PropertyRecord,
    unitCode: string,
    ignoreUnitId = '',
  ): boolean {
    const codeKey = this.norm(unitCode);
    return property.units.some((item) => {
      if (ignoreUnitId && item.id === ignoreUnitId) {
        return false;
      }
      return this.norm(item.unitCode) === codeKey;
    });
  }

  private norm(value: string): string {
    return (value ?? '').trim().toLowerCase();
  }

  private normalizeProperties(rows: PropertyRecord[]): PropertyRecord[] {
    return rows.map((property) => ({
      ...property,
      address: property.address ?? '',
      description: property.description ?? '',
      units: (property.units ?? []).map((unit) => this.normalizeUnit(unit)),
    }));
  }

  private normalizeUnit(unit: UnitRecord): UnitRecord {
    const configuration = (unit.configuration ?? unit.type ?? '1BHK') as BHKType;
    const furnishing = (unit.furnishing ?? 'unfurnished') as FurnishingType;

    return {
      ...unit,
      configuration,
      type: unit.type ?? configuration,
      furnishing,
      carpetAreaSqFt: Number(unit.carpetAreaSqFt ?? 0),
      parking: {
        twoWheelerSlots: Number(unit.parking?.twoWheelerSlots ?? 0),
        fourWheelerSlots: Number(unit.parking?.fourWheelerSlots ?? 0),
      },
      utilities: {
        electricityProvider: unit.utilities?.electricityProvider ?? '',
        meterNumber: unit.utilities?.meterNumber ?? '',
        gasLine: unit.utilities?.gasLine ?? 'no',
        waterSupply: unit.utilities?.waterSupply ?? 'corporation',
      },
      media: (unit.media ?? []).map((item, index) => ({
        id: item.id ?? `${unit.id}-media-${index + 1}`,
        type: item.type,
        url: item.url,
        title: item.title ?? '',
      })),
    };
  }

  private makeId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
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
