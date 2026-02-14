import { Component, Input } from '@angular/core';

@Component({
  selector: 'r360-button',
  template: '<button [type]="type" class="rounded-lg px-4 py-2 shadow-sm bg-secondary text-white hover:shadow-md"><ng-content></ng-content></button>',
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
}
