import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { ReportsComponent } from './reports.component';

const routes: Routes = [{ path: '', component: ReportsComponent }];

@NgModule({ declarations: [ReportsComponent], imports: [SharedModule, RouterModule.forChild(routes)] })
export class ReportsModule {}
