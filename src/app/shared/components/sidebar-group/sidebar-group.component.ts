import { Component, Input } from '@angular/core';

@Component({ selector: 'r360-sidebar-group', template: '<ng-content></ng-content>' })
export class SidebarGroupComponent { @Input() label = ''; }
