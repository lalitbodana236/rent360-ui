import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiClientService } from './api-client.service';

export type UserRole =
  | 'admin'
  | 'owner'
  | 'tenant'
  | 'societyAdmin'
  | 'security'
  | 'vendor'
  | 'publicUser';

export interface AuthUser {
  id: number;
  fullName: string;
  email: string;
  mobileNumber: string;
  address: string;
  currency: 'USD' | 'INR' | 'EUR' | 'GBP' | 'AED';
  roles: UserRole[];
}

interface MockAuthUser extends AuthUser {
  password: string;
}

interface StoredSession {
  user: AuthUser;
  expiresAt: number;
}

const SESSION_KEY = 'r360_auth_session';
const ROLE_OVERRIDES_KEY = 'r360_auth_role_overrides';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const AVAILABLE_ROLES: UserRole[] = [
  'admin',
  'owner',
  'tenant',
  'societyAdmin',
  'security',
  'vendor',
  'publicUser',
];

@Injectable()
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.readSession());
  readonly currentUser$ = this.userSubject.asObservable();

  constructor(private readonly apiClient: ApiClientService) {}

  get snapshotUser(): AuthUser | null {
    return this.userSubject.value;
  }

  isAuthenticated(): Observable<boolean> {
    return this.currentUser$.pipe(map((user) => !!user));
  }

  hasRole(role: UserRole): boolean {
    return !!this.snapshotUser?.roles.includes(role);
  }

  hasAnyRole(roles: UserRole[]): boolean {
    if (!roles.length) {
      return true;
    }
    return roles.some((role) => this.hasRole(role));
  }

  login(email: string, password: string): Observable<AuthUser> {
    return this.fetchMockUsers()
      .pipe(
        map((users) => {
          const user = users.find(
            (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
          );

          if (!user) {
            throw new Error('Invalid email or password');
          }

          const { password: _, ...safeUser } = user;
          const effectiveUser = this.applyRoleOverride(safeUser);
          this.setSession(effectiveUser);
          return effectiveUser;
        }),
      );
  }

  register(payload: Omit<MockAuthUser, 'id'>): Observable<AuthUser> {
    const created: AuthUser = {
      ...payload,
      id: Date.now(),
    };
    this.setSession(created);
    return of(created);
  }

  logout(): Observable<boolean> {
    sessionStorage.removeItem(SESSION_KEY);
    this.userSubject.next(null);
    return of(true);
  }

  private setSession(user: AuthUser): void {
    const payload: StoredSession = {
      user,
      expiresAt: Date.now() + SESSION_TTL_MS,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    this.userSubject.next(user);
  }

  private readSession(): AuthUser | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) {
        return null;
      }

      const parsed = JSON.parse(raw) as StoredSession;
      if (!parsed?.user || !parsed?.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }

      if (Date.now() > parsed.expiresAt) {
        sessionStorage.removeItem(SESSION_KEY);
        return null;
      }

      return parsed.user;
    } catch {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
  }

  listUsers(): Observable<AuthUser[]> {
    return this.fetchMockUsers()
      .pipe(
        map((users) =>
          users.map(({ password: _, ...user }) => this.applyRoleOverride(user)),
        ),
      );
  }

  isClientRoleManagementEnabled(): boolean {
    return environment.accessControl.enableClientRoleManagement;
  }

  availableRoles(): UserRole[] {
    return [...AVAILABLE_ROLES];
  }

  getUserRoleOverride(email: string): UserRole[] | null {
    if (!this.isClientRoleManagementEnabled()) {
      return null;
    }
    const overrides = this.readRoleOverrides();
    return overrides[email] ?? null;
  }

  setUserRoles(email: string, roles: UserRole[]): void {
    if (!this.isClientRoleManagementEnabled()) {
      return;
    }
    const normalized = this.normalizeRoles(roles);
    const overrides = this.readRoleOverrides();
    overrides[email] = normalized;
    this.persistRoleOverrides(overrides);
    this.refreshCurrentUserIfMatching(email, normalized);
  }

  clearUserRoleOverride(email: string): void {
    if (!this.isClientRoleManagementEnabled()) {
      return;
    }
    const overrides = this.readRoleOverrides();
    delete overrides[email];
    this.persistRoleOverrides(overrides);
    this.listUsers().subscribe((users) => {
      const updated = users.find((user) => user.email === email);
      if (updated) {
        this.refreshCurrentUserIfMatching(email, updated.roles);
      }
    });
  }

  private fetchMockUsers(): Observable<MockAuthUser[]> {
    return this.apiClient
      .get<{ users: MockAuthUser[] }>({
        endpoint: 'auth/users',
        mockPath: 'auth/users.json',
      })
      .pipe(map((res) => res.users));
  }

  private applyRoleOverride(user: AuthUser): AuthUser {
    if (!this.isClientRoleManagementEnabled()) {
      return user;
    }
    const override = this.getUserRoleOverride(user.email);
    if (!override?.length) {
      return user;
    }
    return { ...user, roles: this.normalizeRoles(override) };
  }

  private readRoleOverrides(): Record<string, UserRole[]> {
    if (!this.isClientRoleManagementEnabled()) {
      return {};
    }
    try {
      const raw = localStorage.getItem(ROLE_OVERRIDES_KEY);
      if (!raw) {
        return {};
      }
      const parsed = JSON.parse(raw) as Record<string, UserRole[]>;
      if (!parsed || typeof parsed !== 'object') {
        return {};
      }
      return parsed;
    } catch {
      return {};
    }
  }

  private persistRoleOverrides(value: Record<string, UserRole[]>): void {
    if (!this.isClientRoleManagementEnabled()) {
      return;
    }
    try {
      localStorage.setItem(ROLE_OVERRIDES_KEY, JSON.stringify(value));
    } catch {
      // Ignore quota/private-mode errors in mock role management.
    }
  }

  private normalizeRoles(roles: UserRole[]): UserRole[] {
    const unique = Array.from(
      new Set(
        roles.filter((role): role is UserRole => AVAILABLE_ROLES.includes(role)),
      ),
    );
    return unique.length ? unique : ['publicUser'];
  }

  private refreshCurrentUserIfMatching(email: string, roles: UserRole[]): void {
    const current = this.snapshotUser;
    if (!current || current.email !== email) {
      return;
    }
    this.setSession({ ...current, roles: this.normalizeRoles(roles) });
  }
}
