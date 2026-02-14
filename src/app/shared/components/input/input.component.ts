import { Component, Input } from '@angular/core';

@Component({
  selector: 'r360-input',
  template: '<input [placeholder]="placeholder" class="w-full rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2" />',
})
export class InputComponent { @Input() placeholder = ''; }
