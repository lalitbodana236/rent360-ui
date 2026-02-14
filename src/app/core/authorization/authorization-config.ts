import { InjectionToken } from '@angular/core';
import { AppFeatureKey } from '../constants/app-features';
import { PERMISSIONS } from '../constants/permissions';
import { UserRole } from '../services/auth.service';

export type PermissionAccess = 'hidden' | 'read' | 'write';

export interface PermissionDefinition {
  label?: string;
  group?: string;
  feature?: AppFeatureKey;
  defaultAccess?: PermissionAccess;
}

export type PermissionMap = Partial<Record<string, PermissionAccess>>;

export interface AuthorizationConfig {
  fallbackAccess: PermissionAccess;
  permissions: Record<string, PermissionDefinition>;
  roleTemplates: Record<UserRole, PermissionMap>;
  userOverrides?: Record<string, PermissionMap>;
}

export const AUTHORIZATION_CONFIG = new InjectionToken<AuthorizationConfig>(
  'AUTHORIZATION_CONFIG',
);

export const DEFAULT_AUTHORIZATION_CONFIG: AuthorizationConfig = {
  fallbackAccess: 'hidden',
  permissions: {
    [PERMISSIONS.authorizationManage]: {
      label: 'Manage Authorization',
      group: 'Admin',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.dashboardView]: {
      label: 'View Dashboard',
      group: 'Dashboard',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.paymentsView]: {
      label: 'View Payments',
      group: 'Payments',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.paymentsWrite]: {
      label: 'Manage Payments',
      group: 'Payments',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.propertiesView]: {
      label: 'View Properties',
      group: 'Properties',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.propertiesWrite]: {
      label: 'Edit Properties',
      group: 'Properties',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.tenantsView]: {
      label: 'View Tenants',
      group: 'Tenants',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.tenantsWrite]: {
      label: 'Manage Tenants',
      group: 'Tenants',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.societyView]: {
      label: 'View Society Module',
      group: 'Society',
      defaultAccess: 'hidden',
      feature: 'enableSocietyModule',
    },
    [PERMISSIONS.societyWrite]: {
      label: 'Edit Society Module',
      group: 'Society',
      defaultAccess: 'hidden',
      feature: 'enableSocietyModule',
    },
    [PERMISSIONS.communicationsView]: {
      label: 'View Communications',
      group: 'Communications',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.tasksView]: {
      label: 'View Tasks',
      group: 'Tasks',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.reportsView]: {
      label: 'View Reports',
      group: 'Reports',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.settingsView]: {
      label: 'View Settings',
      group: 'Settings',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.settingsWrite]: {
      label: 'Edit Settings',
      group: 'Settings',
      defaultAccess: 'hidden',
    },
    [PERMISSIONS.marketplaceView]: {
      label: 'View Marketplace',
      group: 'Marketplace',
      defaultAccess: 'hidden',
      feature: 'enableMarketplace',
    },
  },
  roleTemplates: {
    admin: {
      [PERMISSIONS.authorizationManage]: 'write',
      [PERMISSIONS.dashboardView]: 'read',
      [PERMISSIONS.paymentsView]: 'read',
      [PERMISSIONS.paymentsWrite]: 'write',
      [PERMISSIONS.propertiesView]: 'read',
      [PERMISSIONS.propertiesWrite]: 'write',
      [PERMISSIONS.tenantsView]: 'read',
      [PERMISSIONS.tenantsWrite]: 'write',
      [PERMISSIONS.societyView]: 'read',
      [PERMISSIONS.societyWrite]: 'write',
      [PERMISSIONS.communicationsView]: 'read',
      [PERMISSIONS.tasksView]: 'read',
      [PERMISSIONS.reportsView]: 'read',
      [PERMISSIONS.settingsView]: 'read',
      [PERMISSIONS.settingsWrite]: 'write',
      [PERMISSIONS.marketplaceView]: 'read',
    },
    owner: {
      [PERMISSIONS.authorizationManage]: 'write',
      [PERMISSIONS.dashboardView]: 'read',
      [PERMISSIONS.paymentsView]: 'read',
      [PERMISSIONS.paymentsWrite]: 'write',
      [PERMISSIONS.propertiesView]: 'read',
      [PERMISSIONS.propertiesWrite]: 'write',
      [PERMISSIONS.tenantsView]: 'read',
      [PERMISSIONS.tenantsWrite]: 'write',
      [PERMISSIONS.communicationsView]: 'read',
      [PERMISSIONS.tasksView]: 'read',
      [PERMISSIONS.reportsView]: 'read',
      [PERMISSIONS.settingsView]: 'read',
      [PERMISSIONS.settingsWrite]: 'write',
    },
    tenant: {
      [PERMISSIONS.dashboardView]: 'read',
      [PERMISSIONS.paymentsView]: 'read',
      [PERMISSIONS.communicationsView]: 'read',
      [PERMISSIONS.tasksView]: 'read',
      [PERMISSIONS.settingsView]: 'read',
    },
    societyAdmin: {
      [PERMISSIONS.authorizationManage]: 'write',
      [PERMISSIONS.dashboardView]: 'read',
      [PERMISSIONS.paymentsView]: 'read',
      [PERMISSIONS.paymentsWrite]: 'write',
      [PERMISSIONS.propertiesView]: 'read',
      [PERMISSIONS.propertiesWrite]: 'write',
      [PERMISSIONS.tenantsView]: 'read',
      [PERMISSIONS.tenantsWrite]: 'write',
      [PERMISSIONS.societyView]: 'read',
      [PERMISSIONS.societyWrite]: 'write',
      [PERMISSIONS.communicationsView]: 'read',
      [PERMISSIONS.tasksView]: 'read',
      [PERMISSIONS.reportsView]: 'read',
      [PERMISSIONS.settingsView]: 'read',
      [PERMISSIONS.settingsWrite]: 'write',
    },
    security: {
      [PERMISSIONS.dashboardView]: 'read',
      [PERMISSIONS.paymentsView]: 'read',
      [PERMISSIONS.communicationsView]: 'read',
      [PERMISSIONS.settingsView]: 'read',
    },
    vendor: {
      [PERMISSIONS.dashboardView]: 'read',
      [PERMISSIONS.communicationsView]: 'read',
      [PERMISSIONS.tasksView]: 'read',
      [PERMISSIONS.settingsView]: 'read',
    },
    publicUser: {
      [PERMISSIONS.dashboardView]: 'read',
      [PERMISSIONS.paymentsView]: 'read',
      [PERMISSIONS.communicationsView]: 'read',
      [PERMISSIONS.settingsView]: 'read',
    },
  },
  userOverrides: {},
};
