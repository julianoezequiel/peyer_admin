import { EmergencyContacts } from "../cadastros/model/emergencyContacts.model";
import { Permissions } from "../cadastros/model/permissions.model";

export interface UserFirebase {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  emailVerified: boolean;
  password: string;
  jobTitle: string;
  birthDate: string;
  permissions: Permissions;
  emergencyContacts: EmergencyContacts[];
}
