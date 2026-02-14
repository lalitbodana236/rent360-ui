import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserSettingsService } from '../../core/services/user-settings.service';

interface SidebarItem {
  label: string;
  route: string;
  children?: { label: string; route: string }[];
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  @Input() collapsed = false;
  readonly user$ = this.settings.userSettings$;

  paymentsExpanded = true;

  readonly items: SidebarItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Properties & Units', route: '/properties' },
    {
      label: 'Payments',
      route: '/payments',
      children: [
        { label: 'Rent & Charges', route: '/payments' },
        { label: 'Accounting', route: '/payments' },
        { label: 'Payment Rules', route: '/payments' },
        { label: 'Payment Accounts', route: '/payments' },
      ],
    },
    { label: 'Tenants', route: '/tenants' },
    { label: 'Maintenance', route: '/society' },
    { label: 'Leasing', route: '/marketplace' },
    { label: 'Communications', route: '/reports' },
    { label: 'Tasks', route: '/reports' },
    { label: 'Reports', route: '/reports' },
    { label: 'Settings', route: '/settings' },
    { label: 'Help', route: '/settings' },
  ];

  constructor(
    private readonly settings: UserSettingsService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
