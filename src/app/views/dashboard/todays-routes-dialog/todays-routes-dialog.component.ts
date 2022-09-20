import { VehicleService } from "./../../pages/services/vehicle.service";
import { Subscription } from "rxjs/internal/Subscription";
import { UsuarioService } from "./../../pages/services/usuario.service";
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import moment, { Moment } from "moment";

import { DailySchedule } from "./../../pages/model/daily-schedule/dailyschedule.model";

@Component({
  selector: "app-todays-routes-dialog",
  templateUrl: "./todays-routes-dialog.component.html",
  styleUrls: ["./todays-routes-dialog.component.scss"],
})
export class TodaysRoutesDialog implements OnInit {
  routesList: {
    from: string;
    to: string;
    time: string;
    driver: string;
    vehicle: string;
  }[] = [];

  loading = true;

  constructor(
    public dialogRef: MatDialogRef<TodaysRoutesDialog>,
    @Inject(MAT_DIALOG_DATA) public list: DailySchedule[],
    private userService: UsuarioService,
    private vehicleService: VehicleService
  ) {}

  async ngOnInit(): Promise<void> {
    this.list = this.list.sort((v1, v2) => {
      let time1 = `${v1.beginTime.substring(0, 2)}:${v1.beginTime.substring(2)}`;
      let time2 = `${v2.beginTime.substring(0, 2)}:${v2.beginTime.substring(2)}`;

      let d1: Moment = moment(`${v1.beginDate} ${time1}`, ["DD/MM/YYYY HH:mm"]);
      let d2: Moment = moment(`${v2.beginDate} ${time2}`, ["DD/MM/YYYY HH:mm"]);

      return moment(d1).diff(d2);
    });

    for (const x of this.list) {
      const driver = await this.userService.getById(x.driverID).get().toPromise();
      const vehicle = await this.vehicleService.getById(x.vehicleID).get().toPromise();

      this.routesList.push({
        from: x.departure,
        to: x.destination,
        time: `${x.beginTime.substring(0, 2)}:${x.beginTime.substring(2)}`,
        driver: driver.data().displayName,
        vehicle: vehicle.data().name,
      });
    }

    this.loading = false;
  }
}
