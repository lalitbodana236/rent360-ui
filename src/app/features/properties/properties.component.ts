import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import {
  BHKType,
  FurnishingType,
  PropertiesDataService,
  PropertyCreatePayload,
  PropertyRecord,
  PropertyStatus,
  PropertyUpdatePayload,
  UnitOccupancyStatus,
  UnitRecord,
  UnitUpsertPayload,
} from './properties-data.service';

interface UnitTableRow {
  propertyId: string;
  propertyName: string;
  propertyStatus: PropertyStatus;
  city: string;
  address: string;
  description: string;
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

  showPropertyForm = false;
  showUnitForm = false;
  editPropertyMode = false;
  editUnitMode = false;
  editingPropertyId = '';
  editingUnitId = '';
  selectedRow: UnitTableRow | null = null;
  formSubmitting = false;
  openActionMenuId: string | null = null;

  readonly bhkOptions: BHKType[] = ['studio', '1BHK', '2BHK', '3BHK', '4BHK', '5BHK+'];
  readonly furnishingOptions: FurnishingType[] = ['unfurnished', 'semi-furnished', 'furnished'];

  readonly propertyForm = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    city: ['', [Validators.required, Validators.minLength(2)]],
    address: ['', [Validators.required, Validators.minLength(5)]],
    description: ['', [Validators.required, Validators.minLength(5)]],
    ownerName: ['', [Validators.required, Validators.minLength(2)]],
    status: ['active' as PropertyStatus, Validators.required],
  });

  readonly unitForm = this.fb.group({
    propertyId: ['', Validators.required],
    unitCode: ['', [Validators.required, Validators.minLength(2)]],
    configuration: ['1BHK' as BHKType, Validators.required],
    furnishing: ['unfurnished' as FurnishingType, Validators.required],
    rent: [0, [Validators.required, Validators.min(0)]],
    occupancyStatus: ['vacant' as UnitOccupancyStatus, Validators.required],
    tenantName: [''],
    carpetAreaSqFt: [0, [Validators.required, Validators.min(0)]],
    parkingTwoWheeler: [0, [Validators.required, Validators.min(0)]],
    parkingFourWheeler: [0, [Validators.required, Validators.min(0)]],
    electricityProvider: ['', Validators.required],
    meterNumber: ['', Validators.required],
    gasLine: ['yes' as 'yes' | 'no', Validators.required],
    waterSupply: ['corporation' as 'corporation' | 'borewell' | 'mixed', Validators.required],
    imageUrl: [''],
    videoUrl: [''],
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly propertiesData: PropertiesDataService,
    private readonly auth: AuthService,
  ) {}

  ngOnInit(): void {
    this.propertiesData.getProperties().subscribe((items) => {
      this.properties = items;
      this.applyFilters();
    });
  }

  get canEdit(): boolean {
    return this.auth.hasAnyRole(['owner', 'societyAdmin']);
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

  rowMenuId(row: UnitTableRow): string {
    return `${row.propertyId}-${row.unit?.id ?? 'no-unit'}`;
  }

  toggleActionMenu(event: MouseEvent, row: UnitTableRow): void {
    event.stopPropagation();
    const key = this.rowMenuId(row);
    this.openActionMenuId = this.openActionMenuId === key ? null : key;
  }

  isActionMenuOpen(row: UnitTableRow): boolean {
    return this.openActionMenuId === this.rowMenuId(row);
  }

  closeActionMenu(): void {
    this.openActionMenuId = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeActionMenu();
  }
  openCreateProperty(): void {
    this.editPropertyMode = false;
    this.editingPropertyId = '';
    this.propertyForm.reset({
      name: '',
      city: '',
      address: '',
      description: '',
      ownerName: this.auth.snapshotUser?.fullName ?? '',
      status: 'active',
    });
    this.showPropertyForm = true;
  }

  openEditProperty(property: PropertyRecord): void {
    this.editPropertyMode = true;
    this.editingPropertyId = property.id;
    this.propertyForm.reset({
      name: property.name,
      city: property.city,
      address: property.address,
      description: property.description,
      ownerName: property.ownerName,
      status: property.status,
    });
    this.showPropertyForm = true;
  }

  editPropertyFromRow(propertyId: string): void {
    const record = this.properties.find((item) => item.id === propertyId);
    if (record) {
      this.openEditProperty(record);
    }
  }

  openCreateUnit(propertyId: string): void {
    this.editUnitMode = false;
    this.editingUnitId = '';
    this.unitForm.reset({
      propertyId,
      unitCode: '',
      configuration: '1BHK',
      furnishing: 'unfurnished',
      rent: 0,
      occupancyStatus: 'vacant',
      tenantName: '',
      carpetAreaSqFt: 0,
      parkingTwoWheeler: 0,
      parkingFourWheeler: 0,
      electricityProvider: '',
      meterNumber: '',
      gasLine: 'yes',
      waterSupply: 'corporation',
      imageUrl: '',
      videoUrl: '',
    });
    this.showUnitForm = true;
  }

  openEditUnit(row: UnitTableRow): void {
    if (!row.unit) {
      return;
    }

    const image = row.unit.media.find((item) => item.type === 'image')?.url ?? '';
    const video = row.unit.media.find((item) => item.type === 'video')?.url ?? '';

    this.editUnitMode = true;
    this.editingUnitId = row.unit.id;
    this.unitForm.reset({
      propertyId: row.propertyId,
      unitCode: row.unit.unitCode,
      configuration: row.unit.configuration,
      furnishing: row.unit.furnishing,
      rent: row.unit.rent,
      occupancyStatus: row.unit.occupancyStatus,
      tenantName: row.unit.tenantName,
      carpetAreaSqFt: row.unit.carpetAreaSqFt,
      parkingTwoWheeler: row.unit.parking.twoWheelerSlots,
      parkingFourWheeler: row.unit.parking.fourWheelerSlots,
      electricityProvider: row.unit.utilities.electricityProvider,
      meterNumber: row.unit.utilities.meterNumber,
      gasLine: row.unit.utilities.gasLine,
      waterSupply: row.unit.utilities.waterSupply,
      imageUrl: image,
      videoUrl: video,
    });
    this.showUnitForm = true;
  }

  viewRowDetails(row: UnitTableRow): void {
    this.selectedRow = row;
  }

  closeDetails(): void {
    this.selectedRow = null;
  }

  cancelPropertyForm(): void {
    this.showPropertyForm = false;
    this.formSubmitting = false;
  }

  cancelUnitForm(): void {
    this.showUnitForm = false;
    this.formSubmitting = false;
  }

  submitProperty(): void {
    if (this.propertyForm.invalid || this.formSubmitting) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    const payload = this.propertyForm.getRawValue() as PropertyCreatePayload;
    this.formSubmitting = true;

    const request$ = this.editPropertyMode
      ? this.propertiesData.updateProperty({
          ...(payload as PropertyUpdatePayload),
          id: this.editingPropertyId,
        })
      : this.propertiesData.createProperty(payload);

    request$.subscribe({
      next: () => {
        this.formSubmitting = false;
        this.showPropertyForm = false;
        this.applyFilters();
      },
      error: () => {
        this.formSubmitting = false;
      },
    });
  }

  submitUnit(): void {
    if (this.unitForm.invalid || this.formSubmitting) {
      this.unitForm.markAllAsTouched();
      return;
    }

    const raw = this.unitForm.getRawValue();
    const imageUrl = (raw.imageUrl ?? '').trim();
    const videoUrl = (raw.videoUrl ?? '').trim();

    const media: UnitUpsertPayload['media'] = [
      {
        id: `${raw.propertyId}-image`,
        type: 'image' as const,
        url: imageUrl,
        title: 'Unit image',
      },
      {
        id: `${raw.propertyId}-video`,
        type: 'video' as const,
        url: videoUrl,
        title: 'Unit video',
      },
    ].filter((item) => !!item.url);

    const payload: UnitUpsertPayload = {
      id: this.editUnitMode ? this.editingUnitId : undefined,
      propertyId: raw.propertyId ?? '',
      unitCode: raw.unitCode ?? '',
      configuration: (raw.configuration ?? '1BHK') as BHKType,
      furnishing: (raw.furnishing ?? 'unfurnished') as FurnishingType,
      rent: Number(raw.rent) || 0,
      occupancyStatus: (raw.occupancyStatus ?? 'vacant') as UnitOccupancyStatus,
      tenantName: raw.tenantName ?? '',
      carpetAreaSqFt: Number(raw.carpetAreaSqFt) || 0,
      parking: {
        twoWheelerSlots: Number(raw.parkingTwoWheeler) || 0,
        fourWheelerSlots: Number(raw.parkingFourWheeler) || 0,
      },
      utilities: {
        electricityProvider: raw.electricityProvider ?? '',
        meterNumber: raw.meterNumber ?? '',
        gasLine: (raw.gasLine ?? 'yes') as 'yes' | 'no',
        waterSupply: (raw.waterSupply ?? 'corporation') as 'corporation' | 'borewell' | 'mixed',
      },
      media,
    };

    this.formSubmitting = true;
    this.propertiesData.upsertUnit(payload).subscribe({
      next: () => {
        this.formSubmitting = false;
        this.showUnitForm = false;
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
              address: property.address,
              description: property.description,
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
          address: property.address,
          description: property.description,
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
          row.address,
          row.ownerName,
          row.unit?.unitCode ?? '',
          row.unit?.configuration ?? '',
          row.unit?.furnishing ?? '',
          row.unit?.tenantName ?? '',
          row.unit?.utilities.electricityProvider ?? '',
          row.unit?.utilities.meterNumber ?? '',
        ]
          .join(' ')
          .toLowerCase();

        return text.includes(searchKey);
      });
  }
}


