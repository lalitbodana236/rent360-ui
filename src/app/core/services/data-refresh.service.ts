import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DataRefreshService {
  private readonly propertiesChangedSubject = new Subject<void>();
  readonly propertiesChanged$ = this.propertiesChangedSubject.asObservable();

  notifyPropertiesChanged(): void {
    this.propertiesChangedSubject.next();
  }
}
