import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserSettingsService } from '../../core/services/user-settings.service';

type SidebarIcon =
  | 'home'
  | 'building'
  | 'wallet'
  | 'users'
  | 'tool'
  | 'key'
  | 'chat'
  | 'task'
  | 'chart'
  | 'settings'
  | 'help'
  | 'logout';

interface SidebarItem {
  label: string;
  route: string;
  icon: SidebarIcon;
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
    { label: 'Dashboard', route: '/dashboard', icon: 'home' },
    { label: 'Properties & Units', route: '/properties', icon: 'building' },
    {
      label: 'Payments',
      route: '/payments',
      icon: 'wallet',
      children: [
        { label: 'Rent & Charges', route: '/payments' },
        { label: 'Accounting', route: '/payments' },
        { label: 'Payment Rules', route: '/payments' },
        { label: 'Payment Accounts', route: '/payments' },
      ],
    },
    { label: 'Tenants', route: '/tenants', icon: 'users' },
    { label: 'Maintenance', route: '/society', icon: 'tool' },
    { label: 'Leasing', route: '/marketplace', icon: 'key' },
    { label: 'Communications', route: '/reports', icon: 'chat' },
    { label: 'Tasks', route: '/reports', icon: 'task' },
    { label: 'Reports', route: '/reports', icon: 'chart' },
    { label: 'Settings', route: '/settings', icon: 'settings' },
    { label: 'Help', route: '/settings', icon: 'help' },
  ];

  constructor(
    private readonly settings: UserSettingsService,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  iconPath(icon: SidebarIcon): string {
    const map: Record<SidebarIcon, string> = {
      home: 'M3 11l9-8 9 8M5 10v10h14V10',
      building: 'M4 21h16M6 21V7l6-4 6 4v14',
      wallet: 'M2 7h20v10H2z M2 10h20 M16 14h.01',
      users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
      tool: 'M12 20h9 M12 4v16 M4 12h8',
      key: 'M7 15a4 4 0 1 1 2.9-6.7L20 8v4h-2v2h-2v2h-2',
      chat: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z',
      task: 'M3 6h18M3 12h18M3 18h18',
      chart: 'M3 3v18h18 M18 9l-5 5-3-3-4 4',
      settings:
        'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6 M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3',
      help: 'M12 18h.01 M10 9a2 2 0 1 1 3.8.8c-.5.8-1.3 1.2-1.8 1.7-.3.3-.5.6-.5 1.5 M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20',
      logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9',
    };

    return map[icon];
  }

  togglePayments(): void {
    this.paymentsExpanded = !this.paymentsExpanded;
  }

  logout(): void {
    this.auth.logout().subscribe(() => this.router.navigate(['/login']));
  }
}
