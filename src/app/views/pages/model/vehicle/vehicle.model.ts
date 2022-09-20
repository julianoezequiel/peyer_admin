import { DriversRouteHistory } from './../vehicle-history/drivers-history.model';
export interface Vehicle {
  _id?: string;
  name: string;
  onRoute: boolean;
  driverID: string;
  licensePlate: string;
  category: string;
}
