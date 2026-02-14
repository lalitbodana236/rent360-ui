import { Component } from '@angular/core';

@Component({
  selector: 'app-payments-list',
  template: `
    <r360-page-header title="Payments" subtitle="Search, filter, and track payment status"></r360-page-header>
    <section class="mb-8">
      <r360-card>
        <div class="flex items-center justify-between mb-8">
          <r360-input placeholder="Search payments"></r360-input>
          <a routerLink="/payments/create" class="rounded-lg bg-secondary text-white px-4 py-2 shadow-sm">Create Payment</a>
        </div>
        <r360-table>
          <thead><tr class="border-b border-gray-200 dark:border-gray-700"><th class="px-6 py-4">ID</th><th class="px-6 py-4">Tenant</th><th class="px-6 py-4">Amount</th><th class="px-6 py-4">Status</th></tr></thead>
          <tbody><tr><td class="px-6 py-4">P-001</td><td class="px-6 py-4">Terry Tenant</td><td class="px-6 py-4">$250.00</td><td class="px-6 py-4"><r360-status-badge value="Paid"></r360-status-badge></td></tr></tbody>
        </r360-table>
      </r360-card>
    </section>
  `,
})
export class PaymentsListComponent {}
