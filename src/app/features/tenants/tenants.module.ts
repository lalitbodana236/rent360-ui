import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { TenantsComponent } from './tenants.component';

const routes: Routes = [{ path: '', component: TenantsComponent }];

@NgModule({ declarations: [TenantsComponent], imports: [SharedModule, RouterModule.forChild(routes)] })
export class TenantsModule {}
