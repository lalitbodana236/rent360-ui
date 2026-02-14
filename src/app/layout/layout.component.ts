import { Component } from '@angular/core';

@Component({
  selector: 'app-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
})
export class LayoutComponent {
  sidebarCollapsed = false;

  toggleCollapse(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
