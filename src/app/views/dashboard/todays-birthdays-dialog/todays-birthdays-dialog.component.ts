import { Component, Inject, OnInit } from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import { UserFirebase } from "./../../pages/model/user/userfirebase.model";

@Component({
  selector: "app-todays-birthdays-dialog",
  templateUrl: "./todays-birthdays-dialog.component.html",
  styleUrls: ["./todays-birthdays-dialog.component.scss"],
})
export class TodaysBirthdaysDialog implements OnInit {
  userList: {
    name: string;
    photoURL: string;
    downloadURL: any;
  }[] = [];

  constructor(
    public dialogRef: MatDialogRef<TodaysBirthdaysDialog>,
    @Inject(MAT_DIALOG_DATA) public users: UserFirebase[],
    private angularFireStorage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    this.users
      .sort((v1, v2) => {
        return v1.displayName.localeCompare(v2.displayName);
      })
      .forEach((x) => {
        this.userList.push({
          name: x.displayName,
          photoURL: x.photoURL,
          downloadURL: null,
        });

        this.downloadPhoto();
      });
  }

  downloadPhoto() {
    this.userList.forEach((u) => {
      if (u.photoURL) {
        this.angularFireStorage
          .ref("/" + u.photoURL)
          .getDownloadURL()
          .subscribe((complete) => {
            const downloadURL = complete;

            u.downloadURL = downloadURL;
          });
      }
    });
  }
}
