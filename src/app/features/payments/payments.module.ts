import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { PaymentsRoutingModule } from './payments-routing.module';
import { PaymentsListComponent } from './payments-list.component';
import { CreatePaymentComponent } from './create-payment.component';

@NgModule({
  declarations: [PaymentsListComponent, CreatePaymentComponent],
  imports: [SharedModule, PaymentsRoutingModule],
})
export class PaymentsModule {}
