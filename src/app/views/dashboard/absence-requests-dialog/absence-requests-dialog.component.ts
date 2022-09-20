import { UsuarioService } from "./../../pages/services/usuario.service";
import {
  AbsenceRequest,
  PERIOD,
  PERIOD_TYPE,
} from "./../../pages/model/absence-requests/absence-requests";
import { Component, Inject, OnInit } from "@angular/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
  selector: "app-absence-requests-dialog",
  templateUrl: "./absence-requests-dialog.component.html",
  styleUrls: ["./absence-requests-dialog.component.scss"],
})
export class AbsenceRequestsDialog implements OnInit {
  absenceRequestsList: {
    user: string;
    beginDate: string;
    endDate: string;
    period: string;
  }[] = [];

  loading = true;

  constructor(
    public dialogRef: MatDialogRef<AbsenceRequestsDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      list: AbsenceRequest[];
      subTitle: string;
      icon: string;
    },
    private userService: UsuarioService
  ) {}

  async ngOnInit() {
    for (const x of this.data.list) {
      const user = await this.userService.getById(x.userID).get().toPromise();

      this.absenceRequestsList.push({
        user: user.data().displayName,
        beginDate: x.beginDate,
        endDate: x.endDate,
        period: new PERIOD_TYPE(x.period as PERIOD).label,
      });
    }

    this.loading = false;
  }
}
