import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { AngularFireStorage } from "@angular/fire/storage";

import { AuthService } from "../../auth/services/auth.service";
import { UserFirebase } from "../model/user/userfirebase.model";
import { ErrorFirebaseService } from "../../error/services/error-firebase.service";

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
    return new Promise(async (resolve, reject) => {

      let userUid = await (await this.afAuth.currentUser).uid;
      let userRelog = (await this.read(userUid).get().toPromise()).data() as UserFirebase;

      console.log("Creating in Authentication...");
      this.authService
        .createUserAuthentication(userToBeCreated)
        .then(async (x) => {
          userToBeCreated.uid = x.user.uid;
          
        console.log("Creating in Database...");
        let created = await this.firestore
          .doc(`${this.collectionName}/${userToBeCreated.uid}`)
          .set(userToBeCreated, { merge: true })
          .catch((error) => {
            console.log(error);
            reject(this.errorFB.getErrorByCode(error))
          });
        })
        .catch((error) => {
          console.log(error);
          reject(error);
        })
        .finally(async () => {
          //console.log("Relog...");
          let relog = await this.authService.SignIn(userRelog.email, userRelog.password)
          .then(() => {/*console.log("OK")*/})
          .catch((error) => {
            console.log(error);
            reject(this.errorFB.getErrorByCode(error))
          })
          .finally(() => resolve(true));
        });
    });
  }

  update(userUpdateUID, userUpdate: UserFirebase, emailCompare: string, passwordCompare: string) {
    return new Promise(async (resolve, reject) => { 
      
      let userUid = await (await this.afAuth.currentUser).uid;
      let userRelog = (await this.read(userUid).get().toPromise()).data() as UserFirebase;

      let updateEmail = userUpdate.email != emailCompare;
      let updatePassword = userUpdate.password != passwordCompare;

      if (updateEmail || updatePassword) {
        this.authService.SignIn(emailCompare, passwordCompare)
        .then(async (x) => {
          
          if (updateEmail) {
            //console.log("Updating EMAIL in Authentication...");
            var processedEmail = await x.user.updateEmail(userUpdate.email)
            .then(() => {
              //console.log("Relog (Email)...");
              this.authService.SignIn(userRelog.email, userRelog.password)
              .catch((error) => reject(error));

              return true;
            })
            .catch((error) => {
              console.log(error);
              reject(this.errorFB.getErrorByCode(error))
              return false;
            });
          } else {
            processedEmail = true;
          }

          if (updatePassword && processedEmail) {
            //console.log("Updating PASSWORD in Authentication...");
            var processedPassword = await x.user.updatePassword(userUpdate.password)
            .then(() => {
              
              //console.log("Relog (Pass)...");
              this.authService.SignIn(userRelog.email, userRelog.password)
              .catch((error) => reject(error));

              return true;
            })
            .catch((error) => {
              //console.log(error);
              reject(this.errorFB.getErrorByCode(error));
              return false;
            });
          } else if (!updatePassword && processedEmail) {
            processedPassword = true;
          }

          //console.log("Relog...");
          var relog = await this.authService.SignIn(userRelog.email, userRelog.password)
          .catch((error) => reject(error));

          if (processedEmail && processedPassword) {
            //console.log("Resolve...");
            resolve(this.firestore.collection(this.collectionName).doc(userUpdateUID).update(userUpdate));
          }

        })
        .catch((error) => reject(error));
      } else {
        resolve(this.firestore.collection(this.collectionName).doc(userUpdateUID).update(userUpdate));
      }      
    });
  }

  updatePasswordFirestore(email: string, newPassword: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      this.firestore
        .collection(this.collectionName, (ref) => ref.where("email", "==", email))
        .get()
        .toPromise()
        .then((response) => {
          let user = response.docs[0].data() as UserFirebase;

          this.authService
            .SignIn(user.email, newPassword)
            .then(() => {
              response.docs[0].ref
                .update({ password: newPassword })
                .then(() => {
                  resolve(null);
                })
                .catch((error) => {
                  console.log(error);
                  reject(error);
                });
            })
            .catch((error) => {
              console.log(error);
              reject(error);
            });
        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
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
        //console.log("Deleting photo from Storage...");
        this.deletePhotoFromStorage(userToBeRemoved.photoURL).catch((error) => {
          console.log(error);
          reject(error);
        });
      }

      let userUid = await (await this.afAuth.currentUser).uid;
      let userRelog = (await this.read(userUid).get().toPromise()).data() as UserFirebase;

      //console.log("Deleting from Authentication");
      this.authService
        .deleteFromAuthentication(userToBeRemoved)
        .catch((error) => {
          console.log(error);
          reject(error);
        })
        .finally(() => {
          //console.log("Relog...");
          this.authService.SignIn(userRelog.email, userRelog.password)
          .catch((error) => reject(error));
        });

      //console.log("Deleting from Database");
      this.firestore
        .collection(this.collectionName)
        .doc(userToBeRemoved.uid)
        .delete()
        .then(() => resolve(null))
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
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
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }

  getDrivers(): Promise<UserFirebase[]> {
    return new Promise(async (resolve, reject) => {
      this.firestore
        .collection(this.collectionName, (ref) => ref
          .where("active", "==", true)
          .where("permissions.driver", "==", true))
        .get()
        .toPromise()
        .then((response) => {

          let driversList: UserFirebase[] = [];
          
          response.docs.forEach(d => {
            let driver = d.data() as UserFirebase;
            driver.password = '';
            driversList.push(driver);
          })

          resolve(driversList);
          
        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error));
        });
    });
  }
}
