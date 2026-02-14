import { Component, Input } from '@angular/core';

@Component({
  selector: 'r360-badge',
  template: '<span class="rounded-lg px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">{{ label }}</span>',
})
export class BadgeComponent { @Input() label = ''; }
