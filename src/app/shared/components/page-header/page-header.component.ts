import { Component, Input } from '@angular/core';

@Component({
  selector: 'r360-page-header',
  template: '<div class="mb-8"><h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100">{{ title }}</h1><p class="text-gray-500 dark:text-gray-300">{{ subtitle }}</p></div>',
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() subtitle = '';
}
