import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReportsComponent } from './reports.component';

const routes: Routes = [
  {
    path: '',
    component: ReportsComponent,
    data: {
      title: 'Reports',
      subtitle: 'Financial, occupancy, and operational reports',
      description: 'Reports module scaffold as per PRODUCT-DEFINATION.',
    },
  },
  {
    path: 'communications',
    component: ReportsComponent,
    data: {
      title: 'Communications',
      subtitle: 'Notices, messages, and communication logs',
      description: 'Communications module scaffold as per PRODUCT-DEFINATION.',
    },
  },
  {
    path: 'tasks',
    component: ReportsComponent,
    data: {
      title: 'Tasks',
      subtitle: 'Track pending and completed operational tasks',
      description: 'Tasks module scaffold as per PRODUCT-DEFINATION.',
    },
  },
];

@NgModule({ declarations: [ReportsComponent], imports: [SharedModule, RouterModule.forChild(routes)] })
export class ReportsModule {}
