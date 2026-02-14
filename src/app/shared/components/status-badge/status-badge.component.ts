import { Component, Input } from '@angular/core';

@Component({
  selector: 'r360-status-badge',
  template: '<span class="rounded-lg px-3 py-1 text-xs font-semibold" [ngClass]="classes">{{ value }}</span>',
})
export class StatusBadgeComponent {
  @Input() value = '';

  get classes(): string {
    const lower = this.value.toLowerCase();
    if (lower.includes('paid') || lower.includes('active')) return 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-200';
    if (lower.includes('late') || lower.includes('warning')) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-200';
    if (lower.includes('due') || lower.includes('danger')) return 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-200';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
  }
}
