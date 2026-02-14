export const environment = {
  production: true,
  branding: {
    appName: 'Rent360',
  },
  api: {
    useMockApi: false,
    apiBaseUrl: 'https://api.example.com',
    mockApiBaseUrl: 'assets/mock-api',
  },
  accessControl: {
    enableClientRoleManagement: false,
    enableClientPermissionOverrides: false,
  },
  appFeatures: {
    enableMarketplace: true,
    enableSocietyModule: true,
    enableVisitorManagement: true,
    enableParking: true,
  },
};
