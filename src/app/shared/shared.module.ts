import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonComponent } from './components/button/button.component';
import { CardComponent } from './components/card/card.component';
import { BadgeComponent } from './components/badge/badge.component';
import { TableComponent } from './components/table/table.component';
import { InputComponent } from './components/input/input.component';
import { PaginationComponent } from './components/pagination/pagination.component';
import { PageHeaderComponent } from './components/page-header/page-header.component';
import { StatusBadgeComponent } from './components/status-badge/status-badge.component';
import { PeriodFilterComponent } from './components/period-filter/period-filter.component';
import { PropertyFilterComponent } from './components/property-filter/property-filter.component';
import { StatsGridComponent } from './components/stats-grid/stats-grid.component';
import { DataTableComponent } from './components/data-table/data-table.component';
import { ExportDropdownComponent } from './components/export-dropdown/export-dropdown.component';
import { ConfirmationModalComponent } from './components/confirmation-modal/confirmation-modal.component';
import { SidebarGroupComponent } from './components/sidebar-group/sidebar-group.component';
import { RoleDirective } from './directives/role.directive';
import { AppCurrencyPipe } from './pipes/app-currency.pipe';

@NgModule({
  declarations: [
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    TableComponent,
    InputComponent,
    PaginationComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    PeriodFilterComponent,
    PropertyFilterComponent,
    StatsGridComponent,
    DataTableComponent,
    ExportDropdownComponent,
    ConfirmationModalComponent,
    SidebarGroupComponent,
    RoleDirective,
    AppCurrencyPipe,
  ],
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonComponent,
    CardComponent,
    BadgeComponent,
    TableComponent,
    InputComponent,
    PaginationComponent,
    PageHeaderComponent,
    StatusBadgeComponent,
    PeriodFilterComponent,
    PropertyFilterComponent,
    StatsGridComponent,
    DataTableComponent,
    ExportDropdownComponent,
    ConfirmationModalComponent,
    SidebarGroupComponent,
    RoleDirective,
    AppCurrencyPipe,
  ],
})
export class SharedModule {}
