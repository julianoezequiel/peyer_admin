import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, CollectionReference, Query } from '@angular/fire/firestore';
import { TranslateService } from '@ngx-translate/core';
import { firestore } from 'firebase-admin';
import _ from 'lodash';
import { ToastrService } from 'ngx-toastr';

import { ErrorFirebaseService } from '../../error/services/error-firebase.service';
import { DailySchedule } from '../model/daily-schedule/dailyschedule.model';
import { VehicleService } from './vehicle.service';

@Injectable({
  providedIn: "root",
})
export class DailyScheduleService {
  constructor(
    private firestore: AngularFirestore,
    private errorFB: ErrorFirebaseService,
    private translate: TranslateService,
    private toastr: ToastrService,
    private vehicleService: VehicleService
  ) { }

  collection = this.firestore.collection<DailySchedule>("daily-schedules");

  getById(id): AngularFirestoreDocument<DailySchedule> {
    return this.collection.doc(id);
  }

  getAll() {
    return this.collection.snapshotChanges();
  }

  count() {
    return this.collection.valueChanges();
  }

  findByDriverAndDate(driver, date) {
    return this.firestore.collection('daily-schedules', ref => {
      let query: CollectionReference | Query = ref;
      if (driver) { query = query.where('driverID', '==', driver) };
      if (date) { query = query.where('beginDate', '==', date) };
      return query;
      
    }).snapshotChanges();
  }

  create(recordToBeCreated: DailySchedule): Promise<any> {

    return new Promise(async (resolve, reject) => {
      delete recordToBeCreated._id;

      recordToBeCreated.vehicleID = recordToBeCreated.vehicleID
        ? recordToBeCreated.vehicleID
        : "";

      let ds = await this.collection
        .add(recordToBeCreated)
        .then((res) => {
          resolve(true);
        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }

  update(recordToBeUpdated: DailySchedule, oldRecord: DailySchedule): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!_.isEqual(recordToBeUpdated, oldRecord)) {
        let id = recordToBeUpdated._id;
        delete recordToBeUpdated._id;

        recordToBeUpdated.vehicleID = recordToBeUpdated.vehicleID
          ? recordToBeUpdated.vehicleID
          : "";

        let ds = await this.collection
          .doc(id)
          .update(recordToBeUpdated)
          .then(async () => {
            resolve(null);
          })
          .catch((error) => {
            console.log(error);
            reject(this.errorFB.getErrorByCode(error));
          });
      } else {
        resolve(true);
      }
    });
  }

  delete(recordToBeRemoved: DailySchedule) {
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
}
