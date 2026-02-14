import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { PropertiesComponent } from './properties.component';

const routes: Routes = [{ path: '', component: PropertiesComponent }];

@NgModule({
  declarations: [PropertiesComponent],
  imports: [SharedModule, RouterModule.forChild(routes)],
})
export class PropertiesModule {}
