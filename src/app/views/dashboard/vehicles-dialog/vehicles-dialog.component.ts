import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { Vehicle } from '../../pages/model/vehicle/vehicle.model';

@Component({
  selector: "app-vehicles-dialog",
  templateUrl: "./vehicles-dialog.component.html",
  styleUrls: ["./vehicles-dialog.component.scss"],
})
export class VehiclesDialog implements OnInit {
  subTitle = "";

  constructor(
    public dialogRef: MatDialogRef<VehiclesDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: { list: Vehicle[]; status: string }
  ) {}

  ngOnInit(): void {
    this.subTitle =
      this.data.status == "onRoute"
        ? "cadastros.vehicles.status.onRoute"
        : "cadastros.vehicles.status.onGarage";
  }
}
