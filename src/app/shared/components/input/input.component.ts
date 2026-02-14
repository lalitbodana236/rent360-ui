import { Component, Input } from '@angular/core';

@Component({
  selector: 'r360-input',
  template: '<input [placeholder]="placeholder" class="r360-input" />',
})
export class InputComponent {
  @Input() placeholder = '';
}
