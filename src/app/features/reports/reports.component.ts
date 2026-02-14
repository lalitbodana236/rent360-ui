import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-reports',
  template: '<r360-page-header [title]="title" [subtitle]="subtitle"></r360-page-header><r360-card>{{ description }}</r360-card>',
})
export class ReportsComponent {
  title = 'Reports';
  subtitle = 'Financial, occupancy, and operational reports';
  description = 'Reports module scaffold as per PRODUCT-DEFINATION.';

  constructor(private readonly route: ActivatedRoute) {
    this.route.data.subscribe((data) => {
      this.title = (data['title'] as string) || this.title;
      this.subtitle = (data['subtitle'] as string) || this.subtitle;
      this.description = (data['description'] as string) || this.description;
    });
  }
}
