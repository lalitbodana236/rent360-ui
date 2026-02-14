import { Component, Input } from '@angular/core';

@Component({ selector: 'r360-data-table', template: '<ng-content></ng-content>' })
export class DataTableComponent { @Input() columns: string[] = []; }
