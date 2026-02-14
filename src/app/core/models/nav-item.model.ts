import { UserRole } from '../services/auth.service';

export interface NavItemModel {
  label: string;
  route: string;
  roles?: UserRole[];
}
