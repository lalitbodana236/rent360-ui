import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Output,
} from '@angular/core';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../core/services/theme.service';

interface HeaderNotification {
  title: string;
  message: string;
  time: string;
  tone: 'high' | 'medium' | 'low';
}

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output() toggleCollapse = new EventEmitter<void>();
  appName = environment.branding.appName;
  notificationsOpen = false;

  notifications: HeaderNotification[] = [
    {
      title: 'Rent overdue alert',
      message: 'Building 2 - Unit 102 is overdue by 14 days.',
      time: '5 min ago',
      tone: 'high',
    },
    {
      title: 'Payment collected',
      message: 'Tenant payment received for Unit 104.',
      time: '32 min ago',
      tone: 'medium',
    },
    {
      title: 'System reminder',
      message: 'Monthly report is ready for export.',
      time: 'Today',
      tone: 'low',
    },
  ];

  constructor(
    private readonly themeService: ThemeService,
    private readonly host: ElementRef<HTMLElement>,
  ) {}

  get unreadCount(): number {
    return this.notifications.filter((n) => n.tone !== 'low').length;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.notificationsOpen = !this.notificationsOpen;
  }

  toneClass(tone: HeaderNotification['tone']): string {
    if (tone === 'high') {
      return 'bg-danger/10 text-danger';
    }
    if (tone === 'medium') {
      return 'bg-warning/10 text-warning';
    }
    return 'bg-success/10 text-success';
  }

  @HostListener('document:click', ['$event'])
  closeOnOutsideClick(event: MouseEvent): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.notificationsOpen = false;
    }
  }
}
