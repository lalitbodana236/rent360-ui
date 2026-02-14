export const PERMISSIONS = {
  authorizationManage: 'authorization.manage',
  dashboardView: 'dashboard.view',
  paymentsView: 'payments.view',
  paymentsWrite: 'payments.write',
  propertiesView: 'properties.view',
  propertiesWrite: 'properties.write',
  tenantsView: 'tenants.view',
  tenantsWrite: 'tenants.write',
  societyView: 'society.view',
  societyWrite: 'society.write',
  communicationsView: 'communications.view',
  tasksView: 'tasks.view',
  reportsView: 'reports.view',
  settingsView: 'settings.view',
  settingsWrite: 'settings.write',
  marketplaceView: 'marketplace.view',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
