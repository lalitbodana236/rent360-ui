import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  AUTHORIZATION_CONFIG,
  AuthorizationConfig,
  PermissionDefinition,
  PermissionMap,
  PermissionAccess,
} from '../authorization/authorization-config';
import { FeatureFlagsService } from './feature-flags.service';
import { AuthService, AuthUser } from './auth.service';

@Injectable()
export class AuthorizationService {
  private readonly overrideStoreKey = 'r360_authorization_overrides';
  private readonly accessRank: Record<PermissionAccess, number> = {
    hidden: 0,
    read: 1,
    write: 2,
  };
  private readonly overridesSubject = new BehaviorSubject<
    Record<string, PermissionMap>
  >(this.readOverridesFromStore());
  readonly overrides$ = this.overridesSubject.asObservable();

  constructor(
    @Inject(AUTHORIZATION_CONFIG) private readonly config: AuthorizationConfig,
    private readonly auth: AuthService,
    private readonly featureFlags: FeatureFlagsService,
  ) {}

  canView(permission: string): boolean {
    return this.canAccess(permission, 'read');
  }

  canWrite(permission: string): boolean {
    return this.canAccess(permission, 'write');
  }

  canAccess(permission: string, minLevel: PermissionAccess = 'read'): boolean {
    const current = this.getAccessLevel(permission);
    return this.accessRank[current] >= this.accessRank[minLevel];
  }

  getAccessLevel(permission: string): PermissionAccess {
    const user = this.auth.snapshotUser;
    if (!user) {
      return 'hidden';
    }
    return this.getAccessLevelForUser(user, permission);
  }

  getAccessLevelForUser(user: AuthUser, permission: string): PermissionAccess {
    if (!this.isFeatureEnabled(permission)) {
      return 'hidden';
    }

    let level = this.getDefaultLevel(permission);

    for (const role of user.roles) {
      const byRole = this.config.roleTemplates[role]?.[permission];
      if (!byRole) {
        continue;
      }
      if (this.accessRank[byRole] > this.accessRank[level]) {
        level = byRole;
      }
    }

    const override = this.overridesSubject.value[user.email]?.[permission];
    return override ?? level;
  }

  getUserOverride(email: string, permission: string): PermissionAccess | null {
    if (!this.isClientPermissionOverridesEnabled()) {
      return null;
    }
    return this.overridesSubject.value[email]?.[permission] ?? null;
  }

  getUserOverrides(email: string): PermissionMap {
    return { ...(this.overridesSubject.value[email] ?? {}) };
  }

  getEnabledPermissions(): Array<{
    key: string;
    definition: PermissionDefinition;
  }> {
    return Object.entries(this.config.permissions)
      .filter(([key]) => this.isFeatureEnabled(key))
      .map(([key, definition]) => ({ key, definition }));
  }

  getOverridesForUser$(email: string): Observable<PermissionMap> {
    return this.overrides$.pipe(
      map((all) => ({ ...(all[email] ?? {}) })),
    );
  }

  setUserOverride(
    email: string,
    permission: string,
    level: PermissionAccess | null,
  ): void {
    if (!this.isClientPermissionOverridesEnabled()) {
      return;
    }
    const current = { ...this.overridesSubject.value };
    const existing = { ...(current[email] ?? {}) };

    if (level === null) {
      delete existing[permission];
    } else {
      existing[permission] = level;
    }

    if (!Object.keys(existing).length) {
      delete current[email];
    } else {
      current[email] = existing;
    }

    this.persistOverrides(current);
  }

  clearUserOverrides(email: string): void {
    if (!this.isClientPermissionOverridesEnabled()) {
      return;
    }
    const current = { ...this.overridesSubject.value };
    delete current[email];
    this.persistOverrides(current);
  }

  isClientPermissionOverridesEnabled(): boolean {
    return environment.accessControl.enableClientPermissionOverrides;
  }

  private isFeatureEnabled(permission: string): boolean {
    const feature = this.config.permissions[permission]?.feature;
    if (!feature) {
      return true;
    }
    return this.featureFlags.isEnabled(feature);
  }

  private getDefaultLevel(permission: string): PermissionAccess {
    return (
      this.config.permissions[permission]?.defaultAccess ??
      this.config.fallbackAccess
    );
  }

  private readOverridesFromStore(): Record<string, PermissionMap> {
    const fromConfig = this.config.userOverrides ?? {};
    if (!this.isClientPermissionOverridesEnabled()) {
      return { ...fromConfig };
    }

    try {
      const raw = localStorage.getItem(this.overrideStoreKey);
      if (!raw) {
        return { ...fromConfig };
      }
      const parsed = JSON.parse(raw) as Record<string, PermissionMap>;
      if (!parsed || typeof parsed !== 'object') {
        return { ...fromConfig };
      }
      return { ...fromConfig, ...parsed };
    } catch {
      return { ...fromConfig };
    }
  }

  private persistOverrides(value: Record<string, PermissionMap>): void {
    this.overridesSubject.next(value);
    if (!this.isClientPermissionOverridesEnabled()) {
      return;
    }
    try {
      localStorage.setItem(this.overrideStoreKey, JSON.stringify(value));
    } catch {
      // Ignore private mode / quota errors for mock authorization state.
    }
  }
}
