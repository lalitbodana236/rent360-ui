import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({ selector: 'r360-confirmation-modal', template: '' })
export class ConfirmationModalComponent {
  @Input() open = false;
  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
}
