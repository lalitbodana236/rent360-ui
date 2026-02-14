import { Component, Input } from '@angular/core';

@Component({ selector: 'r360-stats-grid', template: '' })
export class StatsGridComponent {
  @Input() cards: unknown[] = [];
}
