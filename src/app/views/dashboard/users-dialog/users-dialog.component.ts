import { Component, Inject, OnInit } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { UserFirebase } from '../../pages/model/user/userfirebase.model';

@Component({
  selector: "app-users-dialog",
  templateUrl: "./users-dialog.component.html",
  styleUrls: ["./users-dialog.component.scss"],
})
export class UsersDialog implements OnInit {
  subTitle: string;

  userList: {
    name: string;
    photoURL: string;
    downloadURL: any;
  }[] = [];

  constructor(
    public dialogRef: MatDialogRef<UsersDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: { list: UserFirebase[]; status: string },
    private angularFireStorage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    this.subTitle =
      this.data.status == "active"
        ? "cadastros.usuarios.campo.ativo"
        : "cadastros.usuarios.campo.inactive";

    this.data.list
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
