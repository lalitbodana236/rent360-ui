import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AppFeatureKey } from '../constants/app-features';

@Injectable()
export class FeatureFlagsService {
  isEnabled(feature: AppFeatureKey): boolean {
    return environment.appFeatures[feature];
  }
}
