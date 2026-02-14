import { Component, EventEmitter, Output } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Output() toggleCollapse = new EventEmitter<void>();
  appName = environment.branding.appName;

  constructor(private readonly themeService: ThemeService) {}

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
