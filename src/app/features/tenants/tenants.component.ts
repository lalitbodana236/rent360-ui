import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PERMISSIONS } from '../../core/constants/permissions';
import { AuthService } from '../../core/services/auth.service';
import { AuthorizationService } from '../../core/services/authorization.service';
import {
  PropertiesDataService,
  PropertyRecord,
} from '../properties/properties-data.service';

type TenantHealth = 'On Track' | 'Due Soon' | 'Overdue';

interface TenantRow {
  id: string;
  name: string;
  property: string;
  unit: string;
  city: string;
  ownerName: string;
  rent: number;
  leaseEnd: string;
  pendingDues: number;
  status: TenantHealth;
  occupancy: string;
}

@Component({
  selector: 'app-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss'],
})
export class TenantsComponent implements OnInit, OnDestroy {
  search = '';
  selectedProperty = 'All';
  selectedStatus: 'All' | TenantHealth = 'All';
  selectedTenant: TenantRow | null = null;

  allTenants: TenantRow[] = [];
  filteredTenants: TenantRow[] = [];
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly auth: AuthService,
    private readonly authorization: AuthorizationService,
    private readonly propertiesData: PropertiesDataService,
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.propertiesData.getProperties().subscribe((properties) => {
        this.allTenants = this.buildTenantRows(properties);
        this.applyFilters();
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get subtitle(): string {
    if (this.isSocietyAdmin || this.isAdmin) {
      return 'Central member tenant view with dues and lease health';
    }
    if (this.isOwner) {
      return 'Tenants across your owned properties';
    }
    if (this.isTenant) {
      return 'Your tenancy details, dues, and lease timeline';
    }
    return 'Tenant profile, tenancy history and status';
  }

  get totalTenants(): number {
    return this.filteredTenants.length;
  }

  get overdueTenants(): number {
    return this.filteredTenants.filter((row) => row.status === 'Overdue').length;
  }

  get dueSoonTenants(): number {
    return this.filteredTenants.filter((row) => row.status === 'Due Soon').length;
  }

  get pendingDuesTotal(): number {
    return this.filteredTenants.reduce((sum, row) => sum + row.pendingDues, 0);
  }

  get propertyOptions(): string[] {
    return ['All', ...Array.from(new Set(this.allTenants.map((row) => row.property)))];
  }

  get canManageTenantActions(): boolean {
    return this.authorization.canWrite(PERMISSIONS.tenantsWrite);
  }

  get canViewTenantActions(): boolean {
    return this.authorization.canView(PERMISSIONS.tenantsView);
  }

  onSearch(value: string): void {
    this.search = value;
    this.applyFilters();
  }

  onPropertyFilter(value: string): void {
    this.selectedProperty = value;
    this.applyFilters();
  }

  onStatusFilter(value: 'All' | TenantHealth): void {
    this.selectedStatus = value;
    this.applyFilters();
  }

  openTenant(row: TenantRow): void {
    this.selectedTenant = row;
  }

  closeTenant(): void {
    this.selectedTenant = null;
  }

  private get currentUserName(): string {
    return (this.auth.snapshotUser?.fullName ?? '').trim().toLowerCase();
  }

  private get isAdmin(): boolean {
    return this.auth.snapshotUser?.roles.includes('admin') ?? false;
  }

  private get isSocietyAdmin(): boolean {
    return this.auth.snapshotUser?.roles.includes('societyAdmin') ?? false;
  }

  private get isOwner(): boolean {
    return this.auth.snapshotUser?.roles.includes('owner') ?? false;
  }

  private get isTenant(): boolean {
    return this.auth.snapshotUser?.roles.includes('tenant') ?? false;
  }

  private buildTenantRows(properties: PropertyRecord[]): TenantRow[] {
    const rows = properties.flatMap((property) =>
      property.units
        .filter((unit) => unit.tenantName?.trim().length > 0)
        .map((unit) => {
          const key = `${property.id}-${unit.id}`;
          const riskSeed = this.hashCode(key);
          const leaseEnd = this.leaseEndDate(riskSeed);
          const pendingDues = this.pendingDueAmount(unit.rent, riskSeed);
          const status = this.healthStatus(pendingDues, leaseEnd);

          return {
            id: key,
            name: unit.tenantName.trim(),
            property: property.name,
            unit: unit.unitCode,
            city: property.city,
            ownerName: property.ownerName,
            rent: unit.rent,
            leaseEnd,
            pendingDues,
            status,
            occupancy: unit.occupancyStatus,
          };
        }),
    );

    return this.scopeByRole(rows);
  }

  private scopeByRole(rows: TenantRow[]): TenantRow[] {
    if (this.isAdmin || this.isSocietyAdmin) {
      return rows;
    }

    const scoped = new Map<string, TenantRow>();
    const userName = this.currentUserName;

    if (this.isOwner && userName) {
      rows
        .filter((row) =>
          row.ownerName
            .toLowerCase()
            .split(',')
            .map((entry) => entry.trim())
            .includes(userName),
        )
        .forEach((row) => scoped.set(row.id, row));
    }

    if (this.isTenant && userName) {
      rows
        .filter((row) => row.name.toLowerCase() === userName)
        .forEach((row) => scoped.set(row.id, row));
    }

    return Array.from(scoped.values());
  }

  private applyFilters(): void {
    const key = this.search.trim().toLowerCase();

    this.filteredTenants = this.allTenants
      .filter((row) =>
        this.selectedProperty === 'All' ? true : row.property === this.selectedProperty,
      )
      .filter((row) =>
        this.selectedStatus === 'All' ? true : row.status === this.selectedStatus,
      )
      .filter((row) => {
        if (!key) {
          return true;
        }
        return [row.name, row.property, row.unit, row.city, row.ownerName]
          .join(' ')
          .toLowerCase()
          .includes(key);
      });
  }

  private pendingDueAmount(rent: number, seed: number): number {
    const mod = Math.abs(seed % 4);
    if (mod === 0) {
      return 0;
    }
    if (mod === 1) {
      return Math.round(rent * 0.1);
    }
    if (mod === 2) {
      return Math.round(rent * 0.2);
    }
    return Math.round(rent * 0.35);
  }

  private healthStatus(pending: number, leaseEnd: string): TenantHealth {
    if (pending > 0) {
      if (pending > 500) {
        return 'Overdue';
      }
      return 'Due Soon';
    }

    const end = new Date(leaseEnd).getTime();
    const now = Date.now();
    const daysLeft = Math.round((end - now) / (24 * 60 * 60 * 1000));
    if (daysLeft <= 30) {
      return 'Due Soon';
    }
    return 'On Track';
  }

  private leaseEndDate(seed: number): string {
    const now = new Date();
    const monthsAhead = 1 + Math.abs(seed % 18);
    const date = new Date(
      now.getFullYear(),
      now.getMonth() + monthsAhead,
      5 + Math.abs(seed % 20),
    );
    return date.toISOString().split('T')[0];
  }

  private hashCode(value: string): number {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}
