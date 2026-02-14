import { Component } from '@angular/core';

@Component({
  selector: 'r360-pagination',
  template:
    '<div class="flex items-center gap-2"><button class="r360-btn-secondary">Prev</button><span class="text-sm text-gray-600 dark:text-gray-300">Page 1</span><button class="r360-btn-secondary">Next</button></div>',
})
export class PaginationComponent {}
