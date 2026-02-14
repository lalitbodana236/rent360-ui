import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PaymentsListComponent } from './payments-list.component';
import { CreatePaymentComponent } from './create-payment.component';

const routes: Routes = [
  { path: '', component: PaymentsListComponent },
  { path: 'create', component: CreatePaymentComponent },
];

@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class PaymentsRoutingModule {}
