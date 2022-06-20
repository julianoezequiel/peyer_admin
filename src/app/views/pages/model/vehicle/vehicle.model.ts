import { UserFirebase } from "../user/userfirebase.model";

export interface Vehicle {
  _id?: string;
  name: string;
  onRoute: boolean;
  lastDriver: {
    uid: string,
    displayName: string,
    contact: string
  };
  licensePlate: string;
  category: string;
  totalWeight: string;
  usefulLoad: string;
}
