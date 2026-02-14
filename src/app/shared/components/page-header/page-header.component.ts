import { Component, Input } from '@angular/core';

@Component({
  selector: 'r360-page-header',
  template:
    '<div class="r360-page-header"><h1 class="r360-page-title">{{ title }}</h1><p class="r360-page-subtitle">{{ subtitle }}</p></div>',
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
