import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService, UserRole } from '../../core/services/auth.service';

@Directive({ selector: '[appRole]' })
export class RoleDirective {
  @Input() set appRole(roles: UserRole[] | UserRole) {
    const list = Array.isArray(roles) ? roles : [roles];
    const allowed = list.length === 0 || this.auth.hasAnyRole(list);
    this.vcr.clear();
    if (allowed) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }

  constructor(
    private readonly tpl: TemplateRef<unknown>,
    private readonly vcr: ViewContainerRef,
    private readonly auth: AuthService,
  ) {}
}
