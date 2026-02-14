import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface DashboardOverview {
  ownerKpis: { label: string; value: string }[];
  collectionHealth: { label: string; percent: number; tone: 'success' | 'info' | 'warning' | 'danger' }[];
  charges: { amount: string; property: string; unit: string; description: string; status: 'Paid' | 'Late' | 'Due'; action: string }[];
}

@Injectable()
export class DashboardDataService {
  getOwnerOverview(): Observable<DashboardOverview> {
    return of({
      ownerKpis: [
        { label: 'Total Properties', value: '124' },
        { label: 'Active Tenants', value: '847' },
        { label: 'Rent Collected', value: '$1,245,300.00' },
        { label: 'Outstanding Balance', value: '$42,120.00' },
      ],
      collectionHealth: [
        { label: 'Deposited', percent: 72, tone: 'success' },
        { label: 'Paid', percent: 86, tone: 'info' },
        { label: 'Late', percent: 9, tone: 'warning' },
        { label: 'Due', percent: 14, tone: 'danger' },
      ],
      charges: [
        { amount: '$100.00', property: 'Building 1', unit: '101', description: 'Monthly rent', status: 'Paid', action: 'Manage' },
        { amount: '$125.00', property: 'Building 2', unit: '102', description: 'Monthly rent', status: 'Late', action: 'Manage' },
        { amount: '$150.00', property: 'Building 3', unit: '103', description: 'Monthly rent', status: 'Due', action: 'Manage' },
        { amount: '$175.00', property: 'Building 4', unit: '104', description: 'Monthly rent', status: 'Paid', action: 'Manage' },
      ],
    });
  }
}
