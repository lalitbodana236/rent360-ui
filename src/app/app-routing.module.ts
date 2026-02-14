import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { LayoutComponent } from './layout/layout.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.module').then((m) => m.AuthModule),
  },
  { path: 'register', redirectTo: 'login/register', pathMatch: 'full' },
  {
    path: 'marketplace',
    loadChildren: () =>
      import('./features/marketplace/marketplace.module').then(
        (m) => m.MarketplaceModule,
      ),
    data: { feature: 'enableMarketplace' },
  },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.module').then(
            (m) => m.DashboardModule,
          ),
      },
      {
        path: 'payments',
        loadChildren: () =>
          import('./features/payments/payments.module').then(
            (m) => m.PaymentsModule,
          ),
        data: { roles: ['owner', 'tenant'] },
      },
      {
        path: 'properties',
        loadChildren: () =>
          import('./features/properties/properties.module').then(
            (m) => m.PropertiesModule,
          ),
        data: { roles: ['owner', 'societyAdmin'] },
      },
      {
        path: 'tenants',
        loadChildren: () =>
          import('./features/tenants/tenants.module').then(
            (m) => m.TenantsModule,
          ),
        data: { roles: ['owner', 'societyAdmin', 'tenant'] },
      },
      {
        path: 'society',
        loadChildren: () =>
          import('./features/society/society.module').then(
            (m) => m.SocietyModule,
          ),
        data: {
          feature: 'enableSocietyModule',
          roles: ['owner', 'societyAdmin', 'tenant', 'security', 'vendor'],
        },
      },
      {
        path: 'reports',
        loadChildren: () =>
          import('./features/reports/reports.module').then(
            (m) => m.ReportsModule,
          ),
        data: { roles: ['owner', 'societyAdmin'] },
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./features/settings/settings.module').then(
            (m) => m.SettingsModule,
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  {
    path: '404',
    loadChildren: () =>
      import('./features/not-found/not-found.module').then(
        (m) => m.NotFoundModule,
      ),
  },
  { path: '**', redirectTo: '404' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: 'enabled' }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
