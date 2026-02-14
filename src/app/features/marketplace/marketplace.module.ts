import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from '../../shared/shared.module';
import { MarketplaceComponent } from './marketplace.component';

const routes: Routes = [{ path: '', component: MarketplaceComponent }];

@NgModule({ declarations: [MarketplaceComponent], imports: [SharedModule, RouterModule.forChild(routes)] })
export class MarketplaceModule {}
