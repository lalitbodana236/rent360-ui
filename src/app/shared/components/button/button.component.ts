import { Component, Input } from '@angular/core';

@Component({
  selector: 'r360-button',
  template: '<button [type]="type" class="r360-btn-primary"><ng-content></ng-content></button>',
})
export class ButtonComponent {
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
}
