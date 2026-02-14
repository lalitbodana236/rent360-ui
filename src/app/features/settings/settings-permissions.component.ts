import { Component, OnInit } from '@angular/core';
import { of } from 'rxjs';
import { catchError, finalize, take, timeout } from 'rxjs/operators';
import { PermissionAccess } from '../../core/authorization/authorization-config';
import { PERMISSIONS } from '../../core/constants/permissions';
import { AuthUser, AuthService } from '../../core/services/auth.service';
import { AuthorizationService } from '../../core/services/authorization.service';

interface PermissionRow {
  key: string;
  label: string;
  group: string;
}

@Component({
  selector: 'app-settings-permissions',
  templateUrl: './settings-permissions.component.html',
  styleUrls: ['./settings-permissions.component.scss'],
})
export class SettingsPermissionsComponent implements OnInit {
  readonly accessOptions: Array<{ value: PermissionAccess; label: string }> = [
    { value: 'hidden', label: 'Hidden' },
    { value: 'read', label: 'Read' },
    { value: 'write', label: 'Write' },
  ];

  users: AuthUser[] = [];
  selectedUser: AuthUser | null = null;
  selectedUserEmail = '';
  canManageAuthorization = false;
  loading = true;
  error = '';
  permissionRows: PermissionRow[] = [];
  permissionOverridesEnabled = true;

  constructor(
    private readonly auth: AuthService,
    private readonly authorization: AuthorizationService,
  ) {
    this.permissionRows = this.authorization
      .getEnabledPermissions()
      .map(({ key, definition }) => ({
        key,
        label: definition.label ?? key,
        group: definition.group ?? 'General',
      }))
      .sort((a, b) =>
        a.group === b.group
          ? a.label.localeCompare(b.label)
          : a.group.localeCompare(b.group),
      );
  }

  ngOnInit(): void {
    this.permissionOverridesEnabled =
      this.authorization.isClientPermissionOverridesEnabled();
    if (!this.permissionOverridesEnabled) {
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
          this.error = 'Failed to load users for permission management.';
          return of([] as AuthUser[]);
        }),
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe((users) => {
        this.users = users;
        if (users.length) {
          this.selectedUserEmail = users[0].email;
          this.selectedUser = users[0];
        }
      });
  }

  selectUser(email: string): void {
    this.selectedUserEmail = email;
    this.selectedUser = this.users.find((user) => user.email === email) ?? null;
  }

  trackByPermission(_: number, row: PermissionRow): string {
    return row.key;
  }

  getRoleList(user: AuthUser | null): string {
    if (!user) {
      return '-';
    }
    return user.roles.join(', ');
  }

  currentAccess(user: AuthUser, permission: string): PermissionAccess {
    return this.authorization.getAccessLevelForUser(user, permission);
  }

  currentOverride(user: AuthUser, permission: string): PermissionAccess | '' {
    return this.authorization.getUserOverride(user.email, permission) ?? '';
  }

  setOverride(user: AuthUser, permission: string, value: string): void {
    const level = (value || null) as PermissionAccess | null;
    this.authorization.setUserOverride(user.email, permission, level);
  }

  resetUser(user: AuthUser): void {
    this.authorization.clearUserOverrides(user.email);
  }
}
