import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: "app-alert-dialog",
  templateUrl: "./alert-dialog.component.html",
  styleUrls: ["./alert-dialog.component.scss"],
})
export class AlertDialogComponent implements OnInit {
  title: string;
  message: string;

  constructor(
    public dialogRef: MatDialogRef<AlertDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { message: string }
  ) {
    // Update view with given values
    // this.title = data.title;
    this.message = data.message;
  }

  ngOnInit(): void {}
}
