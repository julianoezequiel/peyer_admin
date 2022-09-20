import { Newsletter } from './../../pages/model/newsletter/newsletter.model';
import { VehicleService } from "../../pages/services/vehicle.service";
import { Subscription } from "rxjs/internal/Subscription";
import { UsuarioService } from "../../pages/services/usuario.service";
import { Component, Inject, OnInit } from "@angular/core";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import moment, { Moment } from "moment";

import { DailySchedule } from "../../pages/model/daily-schedule/dailyschedule.model";

@Component({
  selector: "app-todays-news-dialog",
  templateUrl: "./todays-news-dialog.component.html",
  styleUrls: ["./todays-news-dialog.component.scss"],
})
export class TodaysNewsDialog implements OnInit {
  newsList: {
    title: string;
    author: string;
  }[] = [];

  loading = true;

  constructor(
    public dialogRef: MatDialogRef<TodaysNewsDialog>,
    @Inject(MAT_DIALOG_DATA) public list: Newsletter[],
    private userService: UsuarioService,
  ) {}

  async ngOnInit(): Promise<void> {
    for (const x of this.list) {
      const author = await this.userService.getById(x.authorID).get().toPromise();

      this.newsList.push({
        title: x.title,
        author: author.data().displayName,
      });
    }

    this.loading = false;
  }
}
