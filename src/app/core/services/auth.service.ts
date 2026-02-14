import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiClientService } from './api-client.service';

export type UserRole =
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
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

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
    return this.apiClient
      .get<{ users: MockAuthUser[] }>({
        endpoint: 'auth/users',
        mockPath: 'auth/users.json',
      })
      .pipe(
        map((res) => {
          const user = res.users.find(
            (entry) => entry.email.toLowerCase() === email.toLowerCase() && entry.password === password,
          );

          if (!user) {
            throw new Error('Invalid email or password');
          }

          const { password: _, ...safeUser } = user;
          this.setSession(safeUser);
          return safeUser;
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
}
