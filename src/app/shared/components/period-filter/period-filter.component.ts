import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({ selector: 'r360-period-filter', template: '' })
export class PeriodFilterComponent {
  @Input() month = '';
  @Input() year = '';
  @Output() monthChange = new EventEmitter<string>();
  @Output() yearChange = new EventEmitter<string>();
}
