import { HttpClient, HttpHeaders } from "@angular/common/http";
import { AngularFireStorage } from "@angular/fire/storage";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";

import {
  Newsletter,
  FileStructure,
} from "./../../../model/newsletter/newsletter.model";
import { Component, Inject, OnInit } from "@angular/core";

@Component({
  selector: "app-news-details-dialog",
  templateUrl: "./news-details-dialog.component.html",
  styleUrls: ["./news-details-dialog.component.scss"],
})
export class NewsDetailsDialog implements OnInit {
  downloadURL: any;

  constructor(
    public dialogRef: MatDialogRef<Newsletter>,
    @Inject(MAT_DIALOG_DATA) public data: {news: Newsletter, author: string},
    private angularFireStorage: AngularFireStorage,
    private http: HttpClient
  ) {}

  ngOnInit(): void {}

  async download(file: FileStructure) {
    if (file) {
      //this.loadingPhoto = true;
      this.downloadURL = await this.angularFireStorage
        .ref(`/newsletters/${file.id}_${file.name}`)
        .getDownloadURL()
        .toPromise()
      /*.finally(() => (this.loadingPhoto = false));*/

      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.onload = (event) => {
        const blob = xhr.response;

        let url = window.URL.createObjectURL(blob);

        const downloadLink = document.createElement("a");
        downloadLink.href = url;
        downloadLink.download = file.name;
        downloadLink.click();
        downloadLink.remove();
        
      };
      xhr.open('GET', this.downloadURL);
      xhr.send();
    }
  }
}
