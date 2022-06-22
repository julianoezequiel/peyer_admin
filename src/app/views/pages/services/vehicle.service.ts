import { VehicleHistoryService } from './vehicle-history.service';
import { TranslateService } from '@ngx-translate/core';
import { Vehicle } from "../model/vehicle/vehicle.model";
import { ErrorFirebaseService } from "../../error/services/error-firebase.service";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class VehicleService {
  constructor(
    private firestore: AngularFirestore,
    private errorFB: ErrorFirebaseService,
    private translate: TranslateService,
    private vehicleHistory: VehicleHistoryService
  ) {}

  collection = this.firestore.collection("vehicles");

  getById(id): AngularFirestoreDocument<Vehicle> {
    return this.collection.doc(id);
  }

  create(recordToBeCreated): Promise<any> {
    return new Promise(async (resolve, reject) => {
      delete recordToBeCreated._id;

      recordToBeCreated.lastDriver.displayName = recordToBeCreated.lastDriver
        .displayName
        ? recordToBeCreated.lastDriver.displayName
        : "";

      let vehicle = await this.collection
        .add(recordToBeCreated)
        .then((res) => {
          res.get().then(x => {
             console.log(x.data());
             
            this.vehicleHistory.createHistoryDrivers (x.id, x.data() as Vehicle)
              .then(() => {
                resolve(true);
              })
              .catch(() => reject(this.translate.instant("failedCreateDriverHistory")));
          });
          
        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }

  update(recordToBeUpdated): Promise<any> {
    return new Promise(async (resolve, reject) => {
      let id = recordToBeUpdated._id;
      delete recordToBeUpdated._id;

      recordToBeUpdated.lastDriver.displayName = recordToBeUpdated.lastDriver
        .displayName
        ? recordToBeUpdated.lastDriver.displayName
        : "";

      let vehicle = await this.collection
        .doc(id)
        .update(recordToBeUpdated)
        .then((res) => resolve(true))
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }

  delete(recordToBeRemoved) {
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
