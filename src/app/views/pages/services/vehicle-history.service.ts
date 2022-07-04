import { ToastrService } from "ngx-toastr";
import { UserFirebase } from "./../model/user/userfirebase.model";
import { DriversHistory } from "./../model/vehicle-history/drivers-history.model";
import { Vehicle } from "./../model/vehicle/vehicle.model";
import { TranslateService } from "@ngx-translate/core";
import { ErrorFirebaseService } from "./../../error/services/error-firebase.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class VehicleHistoryService {
  constructor(
    private firestore: AngularFirestore,
    private errorFB: ErrorFirebaseService,
    private translate: TranslateService,
    private toastr: ToastrService
  ) {}

  parentCollection = this.firestore.collection("vehicles");

  driversSubCollection = "drivers_history";
  routesSubCollection = "routes_history";
  damagesSubCollection = "damages_history";

  async createHistoryDrivers(idVehicle: string, vehicle: Vehicle) {
    return new Promise(async (resolve, reject) => {
      let driverHistory = new DriversHistory(
        vehicle.lastDriver as UserFirebase,
        vehicle.updateDate
      );

      this.parentCollection
      .doc(idVehicle)
      .collection(this.driversSubCollection)
      .add(JSON.parse(JSON.stringify(driverHistory)))
      .catch((error) => {
        console.log(error);

        this.toastr.warning(
          this.errorFB.getErrorByCode(error),
          this.translate.instant("cadastros.vehicles.msg.failedCreateDriverHistory"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
      })
      .finally(() => resolve(true));

    });
  }

  getHistoryDrivers(idVehicle: string) {
    return this.parentCollection.doc(idVehicle).collection(this.driversSubCollection);
  }

}
