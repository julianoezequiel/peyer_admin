import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentData, Query } from '@angular/fire/firestore';
import _ from 'lodash';
import moment from 'moment';

import { ErrorFirebaseService } from '../../error/services/error-firebase.service';
import { Vehicle } from '../model/vehicle/vehicle.model';
import { DailySchedule } from './../model/daily-schedule/dailyschedule.model';

@Injectable({
  providedIn: "root",
})
export class VehicleService {
  constructor(
    private firestore: AngularFirestore,
    private errorFB: ErrorFirebaseService,
  ) {}

  collectionName = "vehicles";
  collection = this.firestore.collection(this.collectionName);

  getById(id): AngularFirestoreDocument<Vehicle> {
    return this.collection.doc(id);
  }

  create(recordToBeCreated: Vehicle): Promise<any> {
    return new Promise(async (resolve, reject) => {
      delete recordToBeCreated._id;

      let vehicle = await this.collection
        .add(recordToBeCreated)
        .then((res) => {
          res.get().then((x) => {
            resolve(true);
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

      if (!_.isEqual(recordToBeUpdated, oldRecord)) {

        let id = recordToBeUpdated._id;
        delete recordToBeUpdated._id;

        this.collection
          .doc(id)
          .update(recordToBeUpdated)
          .then(() => resolve(true))
          .catch((error) => {
            console.log(error);
            reject(this.errorFB.getErrorByCode(error));
          });
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

  getAllByFilters(onRoute: boolean) {
    return this.firestore
      .collection(this.collectionName, ref => ref.where("onRoute", "==", onRoute))
      .snapshotChanges();
  }

  count() {
    return this.firestore.collection<Vehicle>(this.collectionName).valueChanges();
  }

  vehiclesList(): Promise<Vehicle[]> {
    return new Promise(async (resolve, reject) => {
      this.collection
        .get()
        .toPromise()
        .then((response) => {
          let vehicleList: Vehicle[] = [];

          response.docs.forEach((v) => {
            let vehicle = v.data() as Vehicle;
            vehicle._id = v.id;

            vehicleList.push(vehicle);
          });

          resolve(vehicleList);
        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }
}
