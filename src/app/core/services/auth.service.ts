import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

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

const SESSION_KEY = 'r360_auth_session';

@Injectable()
export class AuthService {
  private readonly userSubject = new BehaviorSubject<AuthUser | null>(this.readSession());
  readonly currentUser$ = this.userSubject.asObservable();

  constructor(private readonly http: HttpClient) {}

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
    if (!environment.api.useMockApi) {
      return throwError(() => new Error('Real API login not configured yet'));
    }

    return this.http.get<{ users: MockAuthUser[] }>('assets/mock-api/auth/users.json').pipe(
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
    localStorage.removeItem(SESSION_KEY);
    this.userSubject.next(null);
    return of(true);
  }

  private setSession(user: AuthUser): void {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    this.userSubject.next(user);
  }

  private readSession(): AuthUser | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
