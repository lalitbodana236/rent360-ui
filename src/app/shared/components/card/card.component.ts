import { Component } from '@angular/core';

@Component({
  selector: 'r360-card',
  template: '<div class="rounded-xl p-6 shadow-sm bg-white dark:bg-gray-800"><ng-content></ng-content></div>',
})
export class CardComponent {}
