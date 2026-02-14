export const environment = {
  production: true,
  branding: {
    appName: 'Rent360',
  },
  api: {
    useMockApi: true,
    apiBaseUrl: 'https://api.example.com',
    mockApiBaseUrl: 'assets/mock-api',
  },
  accessControl: {
    enableClientRoleManagement: true,
    enableClientPermissionOverrides: true,
  },
  appFeatures: {
    enableMarketplace: true,
    enableSocietyModule: true,
    enableVisitorManagement: true,
    enableParking: true,
  },
};
