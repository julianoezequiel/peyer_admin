import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import moment, { Moment } from 'moment';

import { UsuarioService } from '../../pages/services/usuario.service';
import { Improvement, REQUEST_TYPE, TYPES_IMPROVEMENT } from './../../pages/model/improvements/improvements';

@Component({
  selector: "app-improvements-dialog",
  templateUrl: "./improvements-dialog.component.html",
  styleUrls: ["./improvements-dialog.component.scss"],
})
export class ImprovementsDialog implements OnInit {
  improvementsList: {
    requestType: string;
    user: string;
    creationDate: string;
  }[] = [];

  loading = true;

  constructor(
    public dialogRef: MatDialogRef<ImprovementsDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      list: Improvement[];
      subTitle: string;
      icon: string;
    },
    private userService: UsuarioService
  ) {}

  async ngOnInit() {
    this.data.list = this.data.list.sort((v1, v2) => {
      let d1: Moment = moment(`${v1.creationDate}`, ["DD/MM/YYYY"]);
      let d2: Moment = moment(`${v2.creationDate}`, ["DD/MM/YYYY"]);

      return moment(d2).diff(d1);
    });

    for (const x of this.data.list) {
      const user = await this.userService.getById(x.userID).get().toPromise();

      this.improvementsList.push({
        requestType: new REQUEST_TYPE(x.requestType as TYPES_IMPROVEMENT).label,
        user: user.data().displayName,
        creationDate: x.creationDate,
      });
    }

    this.loading = false;
  }
}
