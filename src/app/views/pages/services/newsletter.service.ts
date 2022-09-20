import { AngularFireStorage } from "@angular/fire/storage";
import { FileStructure, Newsletter } from "./../model/newsletter/newsletter.model";
import { UserFirebase } from "../model/user/userfirebase.model";
import { DriversRouteHistory } from "../model/vehicle-history/drivers-history.model";
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
export class NewsletterService {
  constructor(
    private firestore: AngularFirestore,
    private errorFB: ErrorFirebaseService,
    private translate: TranslateService,
    private angularFireStorage: AngularFireStorage,
    private toastr: ToastrService,
    private fireStorage: AngularFireStorage
  ) {}

  collection = this.firestore.collection("newsletters");

  getById(id): AngularFirestoreDocument<Newsletter> {
    return this.collection.doc(id);
  }

  create(recordToBeCreated: Newsletter): Promise<any> {
    return new Promise(async (resolve, reject) => {
      delete recordToBeCreated._id;

      let newsletter = await this.collection
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

  update(recordToBeUpdated: Newsletter, oldRecord: Newsletter): Promise<any> {
    return new Promise(async (resolve, reject) => {
      if (!_.isEqual(recordToBeUpdated, oldRecord)) {
        let id = recordToBeUpdated._id;
        delete recordToBeUpdated._id;

        let newsletter = await this.collection
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

  delete(recordToBeRemoved: Newsletter) {
    return new Promise(async (resolve, reject) => {

      if (recordToBeRemoved.attachments.length > 0) {
        //console.log("Deleting photo from Storage...");
        let deletedFiles = await this.deleteAllAttachmentsStorage(recordToBeRemoved.attachments)
        .catch((error) => {
          console.log(error);
          reject(error);
        });
      }

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

  count() {
    return this.collection.valueChanges();
  }

  uploadAttachments(file) {
    return new Promise(async (resolve, reject) => {
      const storageRef = await this.angularFireStorage.ref(`newsletters/${file.id}_${file.name}`);

      const t = await storageRef
        .put(file.fileProperties)
        .then(async (task) => {

          let t = await task.task
            .then((t) => {
              resolve(true);
            })
            .catch((error) => {
              console.log(error);
              reject(this.errorFB.getErrorByCode(error));
            });

        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }
  
  /* Delete ALL attachments from firebase storage */
  deleteAllAttachmentsStorage(attachments: FileStructure[]) {
    return new Promise((resolve, reject) => {

      attachments.forEach((file, index) => {

        let fullPath = `newsletters/${file.id}_${file.name}`;

        this.fireStorage
        .ref(fullPath)
        .delete()
        .toPromise()
        .then(() => {

          if (index == attachments.length - 1) {
            resolve(true);
          }
        })
        .catch((error) => {
          console.log(error);

          if (index == attachments.length - 1) {
            reject(error);
          }
        });
      })

    });
  }

  /* Delete attachment from firebase storage */
  deleteAttachmentStorage(url: string) {
    return new Promise((resolve, reject) => {
      this.fireStorage
        .ref(url)
        .delete()
        .toPromise()
        .then(() => {
          resolve(null);
        })
        .catch((error) => {
          console.log(error);

          let objError = {
            code: error.code.split("/")[1],
            error: this.errorFB.getErrorByCode(error),
          };

          reject(objError);
        });
    });
  }

  setAttachmentsDatabase(idRecord: string, attachments: FileStructure[]) {
    this.collection
      .doc(idRecord)
      .set({ attachments: attachments }, { merge: true })
      //.then(() => console.log("CHANGED ATTACHMENTS"))
      .catch((error) => {
        console.log(error);
      });
  }
}
