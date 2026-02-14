import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { SocietyComponent } from './society.component';

const routes: Routes = [{ path: '', component: SocietyComponent }];

@NgModule({ declarations: [SocietyComponent], imports: [SharedModule, RouterModule.forChild(routes)] })
export class SocietyModule {}
