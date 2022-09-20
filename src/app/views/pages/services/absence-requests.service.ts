import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument, DocumentData, Query } from '@angular/fire/firestore';
import _ from 'lodash';

import { ErrorFirebaseService } from '../../error/services/error-firebase.service';
import { AbsenceRequest, STATUS_ABSENCE } from './../model/absence-requests/absence-requests';

@Injectable({
  providedIn: "root",
})
export class AbsenceRequestsService {
  constructor(
    private firestore: AngularFirestore,
    private errorFB: ErrorFirebaseService
  ) {}

  collectionName = "absence-requests";
  collection = this.firestore.collection<AbsenceRequest>(this.collectionName);

  getById(id): AngularFirestoreDocument<AbsenceRequest> {
    return this.collection.doc(id);
  }

  create(recordToBeCreated: AbsenceRequest): Promise<any> {
    return new Promise(async (resolve, reject) => {
      delete recordToBeCreated._id;

      let request = await this.collection
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

  update(recordToBeUpdated: AbsenceRequest, oldRecord: AbsenceRequest): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!_.isEqual(recordToBeUpdated, oldRecord)) {
        let id = recordToBeUpdated._id;
        delete recordToBeUpdated._id;

        let request = await this.collection
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

  setStatus(idRecord: string, status: STATUS_ABSENCE) {
    return new Promise(async (resolve, reject) => {
      this.firestore
        .collection(this.collectionName)
        .doc(idRecord)
        .set({ status: status }, { merge: true })
        .then(() => resolve(null))
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }

  delete(recordToBeRemoved: AbsenceRequest) {
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
    return this.collection.get();
  }

  getAllByFilters(status: number) {
    return this.firestore
      .collection<AbsenceRequest>(this.collectionName, ref => ref.where("status", "==", status))
      .get();
  }

  count() {
    return this.collection.valueChanges();
  }
}
