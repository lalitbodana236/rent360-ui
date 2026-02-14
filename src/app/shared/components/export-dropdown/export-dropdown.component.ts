import { Component, EventEmitter, Output } from '@angular/core';

@Component({ selector: 'r360-export-dropdown', template: '' })
export class ExportDropdownComponent {
  @Output() exportPdf = new EventEmitter<void>();
  @Output() exportExcel = new EventEmitter<void>();
}
