import { UserFirebase } from "./../model/user/userfirebase.model";
import { DriversHistory } from "./../model/vehicle-history/drivers-history.model";
import { ToastrService } from "ngx-toastr";
import { VehicleHistoryService } from "./vehicle-history.service";
import { TranslateService } from "@ngx-translate/core";
import { Vehicle } from "../model/vehicle/vehicle.model";
import { ErrorFirebaseService } from "../../error/services/error-firebase.service";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { Injectable } from "@angular/core";
import _ from "lodash";
import moment from "moment";

@Injectable({
  providedIn: "root",
})
export class VehicleService {
  constructor(
    private firestore: AngularFirestore,
    private errorFB: ErrorFirebaseService,
    private translate: TranslateService,
    private vehicleHistory: VehicleHistoryService,
    private toastr: ToastrService
  ) {}

  collection = this.firestore.collection("vehicles");

  driversSubCollection = "drivers_history";
  routesSubCollection = "routes_history";
  damagesSubCollection = "damages_history";

  getById(id): AngularFirestoreDocument<Vehicle> {
    return this.collection.doc(id);
  }

  create(recordToBeCreated: Vehicle): Promise<any> {
    return new Promise(async (resolve, reject) => {
      delete recordToBeCreated._id;

      recordToBeCreated.lastDriver.displayName = recordToBeCreated.lastDriver
        .displayName
        ? recordToBeCreated.lastDriver.displayName
        : "";

      let vehicle = await this.collection
        .add(recordToBeCreated)
        .then((res) => {
          res.get().then((x) => {
            this.vehicleHistory
              .createHistoryDrivers(x.id, x.data() as Vehicle)
              .then(() => {})
              .finally(() => resolve(true));
          });
        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }

  update(recordToBeUpdated: Vehicle, oldRecord: Vehicle): Promise<any> {
    return new Promise(async (resolve, reject) => {

      delete oldRecord.updateDate;
      delete recordToBeUpdated.updateDate;

      if (!_.isEqual(recordToBeUpdated, oldRecord)) {
        
        recordToBeUpdated.updateDate = moment(new Date()).format("DD/MM/YYYY HH:mm");

        let id = recordToBeUpdated._id;
        delete recordToBeUpdated._id;
  
        recordToBeUpdated.lastDriver.displayName = recordToBeUpdated.lastDriver
          .displayName
          ? recordToBeUpdated.lastDriver.displayName
          : "";
  
        let vehicle = await this.collection
          .doc(id)
          .update(recordToBeUpdated)
          .catch((error) => {
            console.log(error);
            reject(this.errorFB.getErrorByCode(error));
          });
  
        let driver_history = await this.vehicleHistory
        .createHistoryDrivers(id, recordToBeUpdated)
        .finally(() => resolve(true));
      } else {
        resolve(true);
      }

    });
  }

  delete(recordToBeRemoved: Vehicle) {
    return new Promise(async (resolve, reject) => {
      this.collection
        .doc(recordToBeRemoved._id)
        .delete()
        .then(() => resolve(null))
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }

  getAll() {
    return this.collection.snapshotChanges();
  }
}
