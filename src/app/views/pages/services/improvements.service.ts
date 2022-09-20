import { Improvement, STATUS_IMPROVEMENT } from "./../model/improvements/improvements";
import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument,
  DocumentData,
  Query,
} from "@angular/fire/firestore";
import _ from "lodash";

import { ErrorFirebaseService } from "../../error/services/error-firebase.service";

@Injectable({
  providedIn: "root",
})
export class ImprovementsService {
  constructor(
    private firestore: AngularFirestore,
    private errorFB: ErrorFirebaseService
  ) {}

  collection = this.firestore.collection("improvements");

  getById(id): AngularFirestoreDocument<Improvement> {
    return this.collection.doc(id);
  }

  create(recordToBeCreated: Improvement): Promise<any> {
    return new Promise(async (resolve, reject) => {
      delete recordToBeCreated._id;

      let improvements = await this.collection
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

  update(recordToBeUpdated: Improvement, oldRecord: Improvement): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!_.isEqual(recordToBeUpdated, oldRecord)) {
        let id = recordToBeUpdated._id;
        delete recordToBeUpdated._id;

        let improvements = await this.collection
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

  setRequestStatus(idRecord: string, status: STATUS_IMPROVEMENT) {
    return new Promise(async (resolve, reject) => {
      this.collection
        .doc(idRecord)
        .set({ requestStatus: status }, { merge: true })
        .then(() => resolve(null))
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }

  delete(recordToBeRemoved: Improvement) {
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

  getAllByFilters(requestType: number, requestStatus: number) {
    return this.firestore
      .collection("improvements", (ref) => {
        let query: Query<DocumentData> = ref;

        if (requestType == 4 && requestStatus != 4) {
          query = ref.where("requestStatus", "==", requestStatus);

        } else if (requestStatus == 4 && requestType != 4) {
          query = ref.where("requestType", "==", requestType);
          
        } else if (requestStatus != 4 && requestType != 4) {
          query = ref
            .where("requestType", "==", requestType)
            .where("requestStatus", "==", requestStatus);
        }

        return query;
      })
      .snapshotChanges();
  }

  count() {
    return this.collection.valueChanges();
  }
}
