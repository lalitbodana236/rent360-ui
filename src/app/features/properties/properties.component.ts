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
  filteredProperties: PropertyRecord[] = [];

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
  propertyFormError = '';
  unitFormError = '';
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

  rowMenuId(propertyId: string, unitId?: string): string {
    return `${propertyId}-${unitId ?? 'no-unit'}`;
  }

  toggleActionMenu(event: MouseEvent, propertyId: string, unitId?: string): void {
    event.stopPropagation();
    const key = this.rowMenuId(propertyId, unitId);
    this.openActionMenuId = this.openActionMenuId === key ? null : key;
  }

  isActionMenuOpen(propertyId: string, unitId?: string): boolean {
    return this.openActionMenuId === this.rowMenuId(propertyId, unitId);
  }

  closeActionMenu(): void {
    this.openActionMenuId = null;
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeActionMenu();
  }

  openCreateProperty(): void {
    this.propertyFormError = '';
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
    this.propertyFormError = '';
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

  openCreateUnit(propertyId: string): void {
    this.unitFormError = '';
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

  openEditUnit(property: PropertyRecord, unit: UnitRecord): void {
    this.unitFormError = '';
    const image = unit.media.find((item) => item.type === 'image')?.url ?? '';
    const video = unit.media.find((item) => item.type === 'video')?.url ?? '';

    this.editUnitMode = true;
    this.editingUnitId = unit.id;
    this.unitForm.reset({
      propertyId: property.id,
      unitCode: unit.unitCode,
      configuration: unit.configuration,
      furnishing: unit.furnishing,
      rent: unit.rent,
      occupancyStatus: unit.occupancyStatus,
      tenantName: unit.tenantName,
      carpetAreaSqFt: unit.carpetAreaSqFt,
      parkingTwoWheeler: unit.parking.twoWheelerSlots,
      parkingFourWheeler: unit.parking.fourWheelerSlots,
      electricityProvider: unit.utilities.electricityProvider,
      meterNumber: unit.utilities.meterNumber,
      gasLine: unit.utilities.gasLine,
      waterSupply: unit.utilities.waterSupply,
      imageUrl: image,
      videoUrl: video,
    });
    this.showUnitForm = true;
  }

  viewPropertyUnitDetails(property: PropertyRecord, unit?: UnitRecord): void {
    this.closeActionMenu();
    this.selectedRow = {
      propertyId: property.id,
      propertyName: property.name,
      propertyStatus: property.status,
      city: property.city,
      address: property.address,
      description: property.description,
      ownerName: property.ownerName,
      unit,
    };
  }

  closeDetails(): void {
    this.selectedRow = null;
  }

  cancelPropertyForm(): void {
    this.showPropertyForm = false;
    this.propertyFormError = '';
    this.formSubmitting = false;
  }

  cancelUnitForm(): void {
    this.showUnitForm = false;
    this.unitFormError = '';
    this.formSubmitting = false;
  }

  submitProperty(): void {
    if (this.propertyForm.invalid || this.formSubmitting) {
      this.propertyForm.markAllAsTouched();
      return;
    }

    this.propertyFormError = '';
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
      error: (error: unknown) => {
        this.formSubmitting = false;
        this.propertyFormError = error instanceof Error ? error.message : 'Failed to save property.';
      },
    });
  }

  submitUnit(): void {
    if (this.unitForm.invalid || this.formSubmitting) {
      this.unitForm.markAllAsTouched();
      return;
    }

    this.unitFormError = '';
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
      error: (error: unknown) => {
        this.formSubmitting = false;
        this.unitFormError = error instanceof Error ? error.message : 'Failed to save unit.';
      },
    });
  }

  private applyFilters(): void {
    const searchKey = this.search.trim().toLowerCase();

    this.filteredProperties = this.properties
      .filter((property) =>
        this.selectedProperty === 'All' ? true : property.name === this.selectedProperty,
      )
      .filter((property) =>
        this.selectedStatus === 'All' ? true : property.status === this.selectedStatus,
      )
      .map((property) => {
        if (!searchKey) {
          return property;
        }

        const propertyText = [
          property.name,
          property.city,
          property.address,
          property.description,
          property.ownerName,
        ]
          .join(' ')
          .toLowerCase();

        if (propertyText.includes(searchKey)) {
          return property;
        }

        const matchedUnits = property.units.filter((unit) => {
          const unitText = [
            unit.unitCode,
            unit.configuration,
            unit.furnishing,
            unit.tenantName,
            unit.utilities.electricityProvider,
            unit.utilities.meterNumber,
          ]
            .join(' ')
            .toLowerCase();

          return unitText.includes(searchKey);
        });

        return { ...property, units: matchedUnits };
      })
      .filter((property) => property.units.length > 0 || this.search.trim() === '' || [
        property.name,
        property.city,
        property.address,
        property.description,
        property.ownerName,
      ].join(' ').toLowerCase().includes(searchKey));
  }
}
