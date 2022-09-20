import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../../../../shared/confirm-dialog/confirm-dialog.component';

import { ImprovementsService } from '../../../services/improvements.service';
import { Improvement, REQUEST_STATUS, STATUS_IMPROVEMENT } from './../../../model/improvements/improvements';

@Component({
  selector: "app-improvement-details-dialog",
  templateUrl: "./improvement-details-dialog.component.html",
  styleUrls: ["./improvement-details-dialog.component.scss"],
})
export class ImprovementDetailsDialog implements OnInit {
  statusImprovement: string;
  changingStatus = false;

  @ViewChild("templategToggleStatus") templategToggleStatus;

  constructor(
    public dialogRef: MatDialogRef<ImprovementDetailsDialog>,
    @Inject(MAT_DIALOG_DATA)
    public data: { improvement: Improvement; name: string },
    private dialog: MatDialog,
    private improvementsService: ImprovementsService,
    public translate: TranslateService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.getStatusColor();
  }

  ngOnDestroy() {
    this.dialog.closeAll();
  }

  getStatusColor() {
    const status = this.data.improvement.requestStatus as REQUEST_STATUS;

    if (status) {
      switch (status.value) {
        case STATUS_IMPROVEMENT.PENDING:
          this.statusImprovement = "pending";
          break;
        case STATUS_IMPROVEMENT.DONE:
          this.statusImprovement = "done";
          break;
        case STATUS_IMPROVEMENT.REJECTED:
          this.statusImprovement = "rejected";
          break;
      }
    }
  }

  onToggleStatus() {
    if (this.statusImprovement == "pending") {
      const dialogRef = this.dialog.open(
        this.templategToggleStatus,
        {
          width: "240px",
          height: "100px",
          panelClass: "toggle-status-dialog",
          id: "toggle-status",
        }
      );
    } else {
      const message = this.translate.instant("cadastros.improvements.title.confirmReturnStatus");

      const dialogData = new ConfirmDialogModel(message);
  
      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: dialogData,
      });
  
      dialogRef.afterClosed().subscribe((dialogResult) => {
        if (dialogResult == true) {
          this.setRequestStatus("pending");
        }
      });
    }
  }

  closeDialog() {
    this.dialog.getDialogById("toggle-status").close(true);
  }

  setRequestStatus(status: string) {

    this.changingStatus = true;

    let requestStatus: STATUS_IMPROVEMENT;

    if (status == "done") {
      requestStatus = STATUS_IMPROVEMENT.DONE;
      this.closeDialog();
    } else if (status == "rejected") {
      requestStatus = STATUS_IMPROVEMENT.REJECTED;
      this.closeDialog();
    } else if (status == "pending") {
      requestStatus = STATUS_IMPROVEMENT.PENDING;
    }

    this.improvementsService
      .setRequestStatus(this.data.improvement._id, requestStatus)
      .then(() => {
        this.toastr.success(
          this.translate.instant("mensagem.sucesso.alterado"),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        
      })
      .catch((error) => {
        this.toastr.warning(
          this.translate.instant("mensagem.falha.alterado") + `\n- ${error}`,
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
      })
      .finally(() => {
        this.dialogRef.close();
        this.changingStatus = false;
      });
  }
}
