import { EmergencyContacts } from "./emergencyContacts.model";
import { Permissions } from "./permissions.model";

export interface UserFirebase {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  //emailVerified: boolean;
  password: string;
  jobTitle: string;
  birthDate: string;
  contact: string;
  permissions: Permissions;
  active: boolean;
  emergencyContacts: EmergencyContacts[];
}
