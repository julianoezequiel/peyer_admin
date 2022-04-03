import { Injectable, NgZone, OnInit } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { Router } from "@angular/router";

import { auth } from "firebase/app";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { environment } from "../../../environments/environment";
import { UserFirebase } from "./userfirebase.model";

@Injectable()
export class AuthService implements OnInit{
  userData: any; // Save logged in user data
  constructor(
    private http: HttpClient,
    public afs: AngularFirestore, // Inject Firestore service
    public afAuth: AngularFireAuth, // Inject Firebase auth service
    public router: Router,
    public ngZone: NgZone // NgZone service to remove outside scope warning) {},
  ) {
    /* Saving user data in localstorage when 
		logged in and setting up null when logged out */
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.userData = user;
        localStorage.setItem("user", JSON.stringify(this.userData));
        JSON.parse(localStorage.getItem("user"));
      } else {
        localStorage.setItem("user", null);
        JSON.parse(localStorage.getItem("user"));
      }
    });
  }
  ngOnInit(): void {
      // var admin = require("firebase-admin");

      // var serviceAccount = require("c:/organicossaojose-19c51-firebase-adminsdk-ej113-3a441338fe.json");

      // admin.initializeApp({
      //   credential: admin.credential.cert(serviceAccount),
      //   databaseURL: "https://organicossaojose-19c51.firebaseio.com",
      // });

  }

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
  SignIn(email, password) {
    return new Promise((resolve, reject) => {
      this.afAuth
        .signInWithEmailAndPassword(email, password)
        .then((result) => {
          // this.SetUserData(result.user);
          localStorage.setItem("user", JSON.stringify(result.user));
          resolve(result);
        })
        .catch((error) => {
          reject(error);
          // window.alert(error.message);
        });
    });
  }

  // Sign up with email/password
  async SignUp(userFirebase: UserFirebase): Promise<UserFirebase> {
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
              password2: userFirebase.password2,
              jobTitle: userFirebase.jobTitle,
              birthDate: userFirebase.birthDate,
              permission: userFirebase.permission
            };
            this.SetUserData(userData);
            resolve(userData);
          });
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // Send email verfificaiton when new user sign up
  SendVerificationMail() {
    return this.afAuth.currentUser.then((u) => {
      u.sendEmailVerification().then((result) => {
        console.log(result);
      });
      // this.router.navigate(["verify-email-address"]);
    });
  }

  // Reset Forggot password
  ForgotPassword(passwordResetEmail) {
    return new Promise((acept, reject) => {
      this.afAuth
        .sendPasswordResetEmail(passwordResetEmail)
        .then((success) => {
          acept(success);
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  // Returns true when user is looged in and email is verified
  get isLoggedIn(): boolean {
    const user = JSON.parse(localStorage.getItem("user"));
    return user !== null && user.emailVerified !== false ? true : false;
  }

  // Sign in with Google
  GoogleAuth() {
    return this.AuthLogin(new auth.GoogleAuthProvider());
  }

  // Auth logic to run auth providers
  AuthLogin(provider) {
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
  }

  /* Setting up user data when sign in with username/password, 
	  sign up with username/password and sign in with social auth  
	  provider in Firestore database using AngularFirestore + AngularFirestoreDocument service */
  SetUserData(user) {
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
      password2: user.password2,
      jobTitle: user.jobTitle,
      birthDate: user.birthDate,
      permission: user.permission
    };

    return userRef.set(userData, {
      merge: true,
    });
  }

  // Sign out
  SignOut() {
    return this.afAuth.signOut().then(() => {
      localStorage.removeItem("user");
      this.router.navigate(["sign-in"]);
    });
  }

  excluir(uid) {
    return null;
    //  admin
    //   .auth()
    //   .deleteUser(uid)
    //   .then(function () {
    //     console.log("Successfully deleted user");
    //   })
    //   .catch(function (error) {
    //     console.log("Error deleting user:", error);
    //   });
  }
}
