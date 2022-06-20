import { Injectable, NgZone, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import firebase from 'firebase';
import { Observable, of } from 'rxjs';

import { UserFirebase } from '../../pages/model/user/userfirebase.model';
import { ErrorFirebaseService } from '../../error/services/error-firebase.service';

@Injectable()
export class AuthService implements OnInit {
  userData: any; // Save logged in user data
  constructor(
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone, // NgZone service to remove outside scope warning)
    public errorFB: ErrorFirebaseService
  ) {
    /* Saving user data in localstorage when 
		logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        // this.userData = user;
        // localStorage.setItem("user", JSON.stringify(this.userData));
        // JSON.parse(localStorage.getItem("user"));
      } else {
        // localStorage.setItem("user", null);
        // JSON.parse(localStorage.getItem("user"));
      }
    });
  }
  ngOnInit(): void {}

  /*
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = "operation", result?: any) {
    return (error: any): Observable<any> => {
      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // Let the app keep running by returning an empty result.
      return of(result);
    };
  }

  //################################################################

  // Sign in with email/password
  SignIn(email, password): Promise<firebase.auth.UserCredential> {
    return new Promise((resolve, reject) => {
      this.afAuth
        .signInWithEmailAndPassword(email, password)
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error))
        });
    });
  }

  /* Create User in Authentication */
  createUserAuthentication(userFirebase: UserFirebase): Promise<any> {
    return new Promise((resolve, reject) => {
      this.afAuth
        .createUserWithEmailAndPassword(
          userFirebase.email,
          userFirebase.password
        )
        .then((result) => {
          resolve(result);
        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error))
        });
    });
  }
  /* Delete user from Authentication */
  deleteFromAuthentication(userToBeRemoved: UserFirebase) {
    return new Promise((resolve, reject) => {
      this.afAuth
        .signInWithEmailAndPassword(
          userToBeRemoved.email,
          userToBeRemoved.password
        )
        .then(() => {
          this.afAuth.currentUser
            .then((x) => {
              x.delete()
                .then(() => resolve(true))
                .catch((error) => {
                  console.log(error);
                  reject(this.errorFB.getErrorByCode(error));
                });
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

  // Reset Forggot password
  ForgotPassword(passwordResetEmail) {
    var actionCodeSettings = {
      url: 'http://localhost:4200/#/forgot-password',
    }

    return new Promise((resolve, reject) => {
      this.afAuth
        .sendPasswordResetEmail(passwordResetEmail)
        .then((success) => {
          resolve(success);
        })
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error))
        });
    });
  }

  confirmPasswordReset(code, newPassword) {
    return new Promise((resolve, reject) => {
      this.afAuth
        .confirmPasswordReset(code, newPassword)
        .then(() => resolve(null))
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error))
        });
    });
  }

  verifyPasswordResetCode(oobCode: string) {
    return new Promise((resolve, reject) => {
      this.afAuth
        .verifyPasswordResetCode(oobCode)
        .then((email) => resolve(email))
        .catch((error) => {
          console.log(error);
          reject(this.errorFB.getErrorByCode(error))
        });
    });
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem("user_firebase");
      this.router.navigate(["login"]);
      console.log("Leaving...");
    });
  }

  // Returns true when user is looged in and email is verified
  /*get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem("user"));
    return user !== null && user.emailVerified !== false ? true : false;
  }*/

  /* Setting up user data when sign in with username/password, 
      sign up with username/password and sign in with social auth  
      provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  /*SetUserData(user) {
    const userRef: AngularFirestoreDocument<any> = this.afs.doc(
      `users/${user.uid}`
    );
    const userData: UserFirebase = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      password: user.password,
      jobTitle: user.jobTitle,
      birthDate: user.birthDate,
      contact: user.contact,
      permissions: user.permissions,
      emergencyContacts: user.emergencyContacts,
    };

    return userRef.set(userData, {
      merge: true,
    });
  }*/

  // Inscrever-se - Sign up with email/password
  /*async SignUp(userFirebase: UserFirebase): Promise<UserFirebase> {
    return new Promise((resolve, reject) => {
      this.afAuth
        .createUserWithEmailAndPassword(
          userFirebase.email,
          userFirebase.password
        )
        .then((result) => {
          this.SendVerificationMail().then(() => {
            const userData: UserFirebase = {
              uid: result.user.uid,
              email: result.user.email,
              displayName: userFirebase.displayName,
              photoURL: result.user.photoURL,
              emailVerified: result.user.emailVerified,
              password: userFirebase.password,
              jobTitle: userFirebase.jobTitle,
              birthDate: userFirebase.birthDate,
              contact: userFirebase.contact,
              permissions: userFirebase.permissions,
              emergencyContacts: userFirebase.emergencyContacts,
            };
            this.SetUserData(userData);
            resolve(userData);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }*/

  // Send email verfificaiton when new user sign up
  /*SendVerificationMail() {
    return this.afAuth.currentUser.then((u) => {
      u.sendEmailVerification().then((result) => {
        console.log(result);
      });
      // this.router.navigate(["verify-email-address"]);
    });
  }*/

  // Sign in with Google
  /*GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }*/

  // Auth logic to run auth providers
  /*AuthLogin(provider) {
    return this.afAuth
      .signInWithPopup(provider)
      .then((result) => {
        this.SetUserData(result.user);
        let user = result.user;
        localStorage.setItem("user", JSON.stringify(user));
        //   this.ngZone.run(() => {
        this.router.navigate(["dashboard"]);
        //   });
      })
      .catch((error) => {
        window.alert(error);
      });
  }*/
}
