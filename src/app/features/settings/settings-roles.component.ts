import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, take, timeout } from 'rxjs/operators';
import { PERMISSIONS } from '../../core/constants/permissions';
import { AuthService, AuthUser, UserRole } from '../../core/services/auth.service';
import { AuthorizationService } from '../../core/services/authorization.service';

interface RoleOption {
  key: UserRole;
  label: string;
  description: string;
}

@Component({
  selector: 'app-settings-roles',
  templateUrl: './settings-roles.component.html',
  styleUrls: ['./settings-roles.component.scss'],
})
export class SettingsRolesComponent implements OnInit {
  readonly roleOptions: RoleOption[] = [
    { key: 'admin', label: 'Admin', description: 'Full platform-level management rights.' },
    { key: 'owner', label: 'Owner', description: 'Manages owned properties, tenants, and billing.' },
    { key: 'tenant', label: 'Tenant', description: 'Sees own payments, requests, and assigned tasks.' },
    { key: 'societyAdmin', label: 'Society Admin', description: 'Manages society operations and members.' },
    { key: 'vendor', label: 'Vendor', description: 'Handles assigned service tasks and marketplace flows.' },
    { key: 'security', label: 'Security', description: 'Operational visibility for access/monitoring workflows.' },
    { key: 'publicUser', label: 'Public User', description: 'Limited access for public marketplace usage.' },
  ];

  users: AuthUser[] = [];
  selectedUser: AuthUser | null = null;
  selectedUserEmail = '';
  canManageAuthorization = false;
  loading = true;
  error = '';
  roleManagementEnabled = true;

  constructor(
    private readonly auth: AuthService,
    private readonly authorization: AuthorizationService,
  ) {}

  ngOnInit(): void {
    this.roleManagementEnabled = this.auth.isClientRoleManagementEnabled();
    if (!this.roleManagementEnabled) {
      this.loading = false;
      return;
    }

    this.canManageAuthorization = this.authorization.canWrite(
      PERMISSIONS.authorizationManage,
    );

    this.auth
      .listUsers()
      .pipe(
        take(1),
        timeout(8000),
        catchError(() => {
          this.error = 'Failed to load users for role management.';
          return of([] as AuthUser[]);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((users) => {
        this.users = users;
        if (users.length) {
          this.selectUser(users[0].email);
        }
      });
  }

  selectUser(email: string): void {
    this.selectedUserEmail = email;
    this.selectedUser = this.users.find((user) => user.email === email) ?? null;
  }

  isRoleChecked(role: UserRole): boolean {
    return this.selectedUser?.roles.includes(role) ?? false;
  }

  hasRoleOverride(user: AuthUser | null): boolean {
    if (!user) {
      return false;
    }
    return !!this.auth.getUserRoleOverride(user.email);
  }

  toggleRole(role: UserRole, checked: boolean): void {
    if (!this.selectedUser) {
      return;
    }

    const current = this.selectedUser.roles;
    const next = checked
      ? [...new Set([...current, role])]
      : current.filter((item) => item !== role);

    this.auth.setUserRoles(this.selectedUser.email, next);
    this.applyUserRoles(this.selectedUser.email, next.length ? next : ['publicUser']);
  }

  resetToDefaultRoles(user: AuthUser): void {
    this.auth.clearUserRoleOverride(user.email);
    this.auth.listUsers().pipe(take(1)).subscribe((users) => {
      this.users = users;
      this.selectUser(user.email);
    });
  }

  private applyUserRoles(email: string, roles: UserRole[]): void {
    this.users = this.users.map((user) =>
      user.email === email ? { ...user, roles } : user,
    );
    this.selectUser(email);
  }
}
