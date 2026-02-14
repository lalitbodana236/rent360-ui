import { Component } from '@angular/core';

@Component({
  selector: 'app-create-payment',
  template: `
    <r360-page-header title="Create Payment" subtitle="Enter payment details"></r360-page-header>
    <section class="mb-8">
      <r360-card>
        <form class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label class="text-sm font-medium mb-2 block">Tenant</label><r360-input placeholder="Tenant name"></r360-input></div>
          <div><label class="text-sm font-medium mb-2 block">Amount</label><r360-input placeholder="Amount"></r360-input></div>
          <div class="md:col-span-2"><r360-button type="submit">Save Payment</r360-button></div>
        </form>
      </r360-card>
    </section>
  `,
})
export class CreatePaymentComponent {}
