import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  CanActivateChild,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AppFeatureKey } from '../constants/app-features';
import { AuthService, UserRole } from '../services/auth.service';
import { FeatureFlagsService } from '../services/feature-flags.service';

@Injectable()
export class AuthGuard implements CanActivate, CanActivateChild {
  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly featureFlags: FeatureFlagsService,
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.check(route, state.url);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree {
    return this.check(route, state.url);
  }

  private check(route: ActivatedRouteSnapshot, returnUrl: string): boolean | UrlTree {
    if (!this.auth.snapshotUser) {
      return this.router.createUrlTree(['/login'], { queryParams: { returnUrl } });
    }

    const feature = route.data['feature'] as AppFeatureKey | undefined;
    if (feature && !this.featureFlags.isEnabled(feature)) {
      return this.router.createUrlTree(['/dashboard']);
    }

    const roles = (route.data['roles'] as UserRole[] | undefined) ?? [];
    if (!roles.length || this.auth.hasAnyRole(roles)) {
      return true;
    }

    return this.router.createUrlTree(['/dashboard']);
  }
}
