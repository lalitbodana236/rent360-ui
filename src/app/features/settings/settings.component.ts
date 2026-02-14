import { Component } from '@angular/core';
import { PERMISSIONS } from '../../core/constants/permissions';
import { AuthService } from '../../core/services/auth.service';
import { AuthorizationService } from '../../core/services/authorization.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {
  readonly canViewPermissions: boolean;
  readonly canViewRoles: boolean;

  constructor(
    private readonly authorization: AuthorizationService,
    private readonly auth: AuthService,
  ) {
    const hasManageAccess = this.authorization.canView(
      PERMISSIONS.authorizationManage,
    );
    this.canViewPermissions =
      hasManageAccess && this.authorization.isClientPermissionOverridesEnabled();
    this.canViewRoles =
      hasManageAccess && this.auth.isClientRoleManagementEnabled();
  }
}
