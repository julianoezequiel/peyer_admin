import { UserFirebase } from './../model/user/userfirebase.model';
import { DriversHistory } from './../model/vehicle-history/drivers-history.model';
import { Vehicle } from './../model/vehicle/vehicle.model';
import { TranslateService } from '@ngx-translate/core';
import { ErrorFirebaseService } from './../../error/services/error-firebase.service';
import { AngularFirestore } from '@angular/fire/firestore';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class VehicleHistoryService {

  constructor(
    private firestore: AngularFirestore,
    private errorFB: ErrorFirebaseService,
    private translate: TranslateService
  ) { }

  collection = this.firestore.collection("vehicle_history");

  driversSubCollection = "drivers_history";
  routesSubCollection = "routes_history";
  damagesSubCollection = "damages_history";

  async createHistoryDrivers(idVehicle: string, vehicle: Vehicle) {
    return new Promise(async (resolve, reject) => {

        let driverHistory = new DriversHistory(vehicle.lastDriver as UserFirebase);

        this.collection.doc(idVehicle).collection(this.driversSubCollection).add(driverHistory)
        .then(() => resolve(true))
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    })
  }
  

}
