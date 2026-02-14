import { Component, Input } from '@angular/core';

@Component({
  selector: 'r360-table',
  template: '<div class="r360-table-wrap"><table class="r360-table"><ng-content></ng-content></table></div>',
})
export class TableComponent {
  @Input() columns: string[] = [];
}
