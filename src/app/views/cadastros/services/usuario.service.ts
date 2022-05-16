import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireStorage } from '@angular/fire/storage';

import { AuthService } from '../../login/auth.service';
import { UserFirebase } from './../model/userfirebase.model';
import { ErrorFirebaseService } from './error-firebase.service';

@Injectable({
  providedIn: "root",
})
export class UsuarioService {
  constructor(
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private authService: AuthService,
    private fireStorage: AngularFireStorage,
    private errorFB: ErrorFirebaseService
  ) {}

  collectionName = "users";

  async create(userToBeCreated: UserFirebase) {
    return new Promise((resolve, reject) => {
      console.log("Creating in Authentication...");
      this.authService
        .createUserAuthentication(userToBeCreated)
        .then((x) => {
          userToBeCreated.uid = x.user.uid;

          console.log("Creating in Database...");
          this.firestore
            .doc(`${this.collectionName}/${userToBeCreated.uid}`)
            .set(userToBeCreated, { merge: true })
            .then(() => resolve(null))
            .catch((error) => {
              console.log(error);
              reject(error);
            });
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  update(recordID, record: UserFirebase) {
    return this.firestore
      .collection(this.collectionName)
      .doc(recordID)
      .update(record);
  }

  read(recordID): AngularFirestoreDocument<UserFirebase> {
    return this.firestore.collection(this.collectionName).doc(recordID);
  }

  read_all() {
    return this.firestore.collection(this.collectionName).snapshotChanges();
  }

  count() {
    return this.firestore.collection(this.collectionName).valueChanges();
  }

  delete(userToBeRemoved: UserFirebase) {
    return new Promise(async (resolve, reject) => {
      if (userToBeRemoved.photoURL) {
        console.log("Deleting photo from Storage...");
        this.deletePhotoFromStorage(userToBeRemoved.photoURL)
        .catch((error) => {
          console.log(error);
          reject(error);
        });
      }

      console.log("Deleting from Authentication");
      this.authService
        .deleteFromAuthentication(userToBeRemoved)
        .catch((error) => {
          console.log(error);
          reject(error);
        });

      console.log("Deleting from Database");
      this.firestore
        .collection(this.collectionName)
        .doc(userToBeRemoved.uid)
        .delete()
        .then(() => resolve(null))
        .catch((error) => {
          console.log(error);
          reject(error);
        });
    });
  }

  /* Delete user photo from firebase storage */
  deletePhotoFromStorage(photoUrl: string) {
    return new Promise((resolve, reject) => {
      this.fireStorage
        .ref(photoUrl)
        .delete()
        .toPromise()
        .then(() => {
          resolve(null);
        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error.code));
        });
    });
  }
}
