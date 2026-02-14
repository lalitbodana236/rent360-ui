import { Component, Input } from '@angular/core';

@Component({
  selector: 'r360-table',
  template: '<div class="overflow-x-auto"><table class="min-w-full"><ng-content></ng-content></table></div>',
})
export class TableComponent { @Input() columns: string[] = []; }
