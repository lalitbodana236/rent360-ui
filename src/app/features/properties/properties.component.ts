import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  PropertiesDataService,
  PropertyCreatePayload,
  PropertyRecord,
  PropertyStatus,
  PropertyUpdatePayload,
  UnitRecord,
} from './properties-data.service';

interface UnitTableRow {
  propertyId: string;
  propertyName: string;
  propertyStatus: PropertyStatus;
  city: string;
  ownerName: string;
  unit?: UnitRecord;
}

@Component({
  selector: 'app-properties',
  templateUrl: './properties.component.html',
  styleUrls: ['./properties.component.scss'],
})
export class PropertiesComponent implements OnInit {
  properties: PropertyRecord[] = [];
  filteredRows: UnitTableRow[] = [];

  search = '';
  selectedProperty = 'All';
  selectedStatus: 'All' | PropertyStatus = 'All';

  showForm = false;
  editMode = false;
  editingId = '';
  formSubmitting = false;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    ownerName: ['', [Validators.required, Validators.minLength(2)]],
    status: ['active' as PropertyStatus, Validators.required],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly propertiesData: PropertiesDataService,
  ) {}

  ngOnInit(): void {
    this.propertiesData.getProperties().subscribe((items) => {
      this.properties = items;
      this.applyFilters();
    });
  }

  get propertyOptions(): string[] {
    return ['All', ...this.properties.map((item) => item.name)];
  }

  get totalProperties(): number {
    return this.properties.length;
  }

  get totalUnits(): number {
    return this.properties.reduce((sum, item) => sum + item.units.length, 0);
  }

  get occupiedUnits(): number {
    return this.properties
      .flatMap((item) => item.units)
      .filter((unit) => unit.occupancyStatus === 'occupied').length;
  }

  get vacantUnits(): number {
    return this.properties
      .flatMap((item) => item.units)
      .filter((unit) => unit.occupancyStatus === 'vacant').length;
  }

  onSearch(value: string): void {
    this.search = value;
    this.applyFilters();
  }

  onPropertyFilter(value: string): void {
    this.selectedProperty = value;
    this.applyFilters();
  }

  onStatusFilter(value: 'All' | PropertyStatus): void {
    this.selectedStatus = value;
    this.applyFilters();
  }

  openCreate(): void {
    this.editMode = false;
    this.editingId = '';
    this.form.reset({
      name: '',
      city: '',
      ownerName: '',
      status: 'active',
    });
    this.showForm = true;
  }

  openEdit(property: PropertyRecord): void {
    this.editMode = true;
    this.editingId = property.id;
    this.form.reset({
      name: property.name,
      city: property.city,
      ownerName: property.ownerName,
      status: property.status,
    });
    this.showForm = true;
  }

  editFromRow(propertyId: string): void {
    const record = this.properties.find((item) => item.id === propertyId);
    if (record) {
      this.openEdit(record);
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.formSubmitting = false;
  }

  submit(): void {
    if (this.form.invalid || this.formSubmitting) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.form.getRawValue() as PropertyCreatePayload;
    this.formSubmitting = true;

    const request$ = this.editMode
      ? this.propertiesData.updateProperty({
          ...(payload as PropertyUpdatePayload),
          id: this.editingId,
        })
      : this.propertiesData.createProperty(payload);

    request$.subscribe({
      next: () => {
        this.formSubmitting = false;
        this.showForm = false;
        this.applyFilters();
      },
      error: () => {
        this.formSubmitting = false;
      },
    });
  }

  private applyFilters(): void {
    const searchKey = this.search.trim().toLowerCase();

    this.filteredRows = this.properties
      .filter((property) =>
        this.selectedProperty === 'All' ? true : property.name === this.selectedProperty,
      )
      .filter((property) =>
        this.selectedStatus === 'All' ? true : property.status === this.selectedStatus,
      )
      .flatMap((property): UnitTableRow[] => {
        if (!property.units.length) {
          return [
            {
              propertyId: property.id,
              propertyName: property.name,
              propertyStatus: property.status,
              city: property.city,
              ownerName: property.ownerName,
              unit: undefined,
            },
          ];
        }

        return property.units.map((unit): UnitTableRow => ({
          propertyId: property.id,
          propertyName: property.name,
          propertyStatus: property.status,
          city: property.city,
          ownerName: property.ownerName,
          unit,
        }));
      })
      .filter((row) => {
        if (!searchKey) {
          return true;
        }

        const text = [
          row.propertyName,
          row.city,
          row.ownerName,
          row.unit?.unitCode ?? '',
          row.unit?.type ?? '',
          row.unit?.tenantName ?? '',
        ]
          .join(' ')
          .toLowerCase();

        return text.includes(searchKey);
      });
  }
}


