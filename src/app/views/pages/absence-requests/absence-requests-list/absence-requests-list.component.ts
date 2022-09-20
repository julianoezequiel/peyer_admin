import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSelect } from '@angular/material/select';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { rowsAnimation } from '../../../../shared/animations';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../../../shared/confirm-dialog/confirm-dialog.component';
import { ErrorFirebaseService } from '../../../error/services/error-firebase.service';
import { AbsenceRequestsService } from '../../services/absence-requests.service';
import { UsuarioService } from '../../services/usuario.service';
import {
  ABSENCE_REQUEST_STATUS,
  AbsenceRequest,
  CAUSE_TYPE,
  PERIOD_TYPE,
  STATUS_ABSENCE,
} from './../../model/absence-requests/absence-requests';

@Component({
  selector: "app-absence-requests-list",
  templateUrl: "./absence-requests-list.component.html",
  styleUrls: ["./absence-requests-list.component.scss"],
  animations: [rowsAnimation],
})
export class AbsenceRequestsListComponent implements OnInit {
  private subscriptions: Subscription[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<{
    absenceRequest: AbsenceRequest;
    name: string;
  }>;
  displayedColumns = [
    "name",
    "beginDate",
    "endDate",
    "status",
    "period",
    "cause",
    "actions",
  ];

  loading = true;

  data: AbsenceRequest[];

  statusColor: string;

  requestStatusList: ABSENCE_REQUEST_STATUS[] = [
    new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.ALL),
    new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.PENDING),
    new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.ACCEPTED),
    new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.REJECTED),
  ];

  @ViewChild("selectStatus", { static: true }) selectStatus: MatSelect;
  @ViewChild("searchFilter", { static: true })
  searchFilter: ElementRef<HTMLInputElement>;

  @ViewChild("templategToggleStatus") templategToggleStatus;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private absenceRequestsService: AbsenceRequestsService,
    private errorFB: ErrorFirebaseService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private userService: UsuarioService
  ) {}

  ngOnInit() {
    this.selectStatus.value = STATUS_ABSENCE.ALL;

    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
    this.dialog.closeAll();
  }

  add() {
    this.router.navigate(["../absence-requests/request"], {
      relativeTo: this.activatedRoute,
    });
  }

  edit(absenceRequest: AbsenceRequest) {
    this.router.navigate(["../absence-requests/request/", absenceRequest._id], {
      relativeTo: this.activatedRoute,
    });
  }

  async delete(absenceRequest: AbsenceRequest) {
    if (absenceRequest._id) {
      this.absenceRequestsService
        .delete(absenceRequest)
        .then(() => {
          this.toastr.success(
            this.translate.instant("mensagem.sucesso.removido"),
            this.translate.instant("alerta.atencao"),
            {
              closeButton: true,
              progressAnimation: "decreasing",
              progressBar: true,
            }
          );
          this.getAll();
        })
        .catch((error) => {
          this.toastr.warning(
            this.translate.instant("mensagem.falha.removido") + `\n- ${error}`,
            this.translate.instant("alerta.atencao"),
            {
              closeButton: true,
              progressAnimation: "decreasing",
              progressBar: true,
            }
          );
        });
    }
  }

  async getAll() {
    this.searchFilter.nativeElement.value = "";

    let getAbsenceRequests = this.absenceRequestsService.getAllByFilters(
      this.selectStatus.value
    );

    if (this.selectStatus.value == 4) {
      getAbsenceRequests = this.absenceRequestsService.getAll();
    }

    const subList = getAbsenceRequests.subscribe(
      (data) => {
        let absenceRequestsList: {
          absenceRequest: AbsenceRequest;
          name: string;
        }[] = [];

        data.forEach(async (e) => {
          let absenceRequest = e.data() as AbsenceRequest;
          absenceRequest._id = e.id;

          absenceRequest.period = new PERIOD_TYPE(null).getByValue(absenceRequest.period);
          absenceRequest.cause = new CAUSE_TYPE(null).getByValue(absenceRequest.cause);
          absenceRequest.status = new ABSENCE_REQUEST_STATUS(null).getByValue(absenceRequest.status);

          let name = "";

          const authorSub = await this.userService
            .getById(absenceRequest.userID)
            .valueChanges()
            .subscribe(async (value) => {
              name = value.displayName;

              if (!absenceRequestsList.some(x => x.absenceRequest._id == absenceRequest._id)) {
                absenceRequestsList.push({
                  absenceRequest: absenceRequest,
                  name: name,
                });
              }

              // refresh data
              this.dataSource.filter = "";
            });

          this.subscriptions.push(authorSub);
        });

        this.initTable(absenceRequestsList);

        this.loading = false;
      },

      (error) => {
        console.log(error);
        return this.errorFB.getErrorByCode(error);
      }
    );

    this.subscriptions.push(subList);
  }

  initTable(list) {
    this.dataSource = new MatTableDataSource(list);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Custom sort when nested object
    this.dataSource.sortingDataAccessor = (data, sort) => {
      if (sort == "name") {
        return data.name.toLowerCase();
      } else if (sort == "beginDate") {
        return moment(data.absenceRequest.beginDate, ["DD/MM/YYYY"]).unix();
      } else if (sort == "endDate") {
        return moment(data.absenceRequest.endDate, ["DD/MM/YYYY"]).unix();
      } else if (sort == "period") {       
        return (data.absenceRequest.period as PERIOD_TYPE).label;
      } else if (sort == "cause") {
        return (data.absenceRequest.cause as CAUSE_TYPE).label;
      }
    };

    // Custom filter when nested object
    this.dataSource.filterPredicate = (data, filter) => {
      filter = filter.toLowerCase().trim();

      return (
        data.name.toLowerCase().includes(filter) ||
        data.absenceRequest.beginDate.includes(filter) ||
        data.absenceRequest.endDate.includes(filter) ||
        (data.absenceRequest.period as PERIOD_TYPE).label.includes(filter) ||
        (data.absenceRequest.cause as CAUSE_TYPE).label.includes(filter)
      );
    };
  }

  confirmDialog(row: AbsenceRequest): void {
    const message = this.translate.instant("mensagem.confirmar");

    const dialogData = new ConfirmDialogModel(message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult == true) {
        this.delete(row);
      }
    });
  }

  getStatusColorSelect() {
    if (this.selectStatus) {
      switch (this.selectStatus.value) {
        case STATUS_ABSENCE.PENDING:
          this.statusColor = "pending";
          break;
        case STATUS_ABSENCE.ACCEPTED:
          this.statusColor = "accepted";
          break;
        case STATUS_ABSENCE.REJECTED:
          this.statusColor = "rejected";
          break;
        case STATUS_ABSENCE.ALL:
          this.statusColor = "all";
          break;
      }
    }
  }

  getStatusColorCell(status) {
    if (status) {
      switch (status) {
        case STATUS_ABSENCE.PENDING:
          return "pending";
        case STATUS_ABSENCE.ACCEPTED:
          return "accepted";
        case STATUS_ABSENCE.REJECTED:
          return "rejected";
      }
    }
  }

  private row: AbsenceRequest;

  onToggleStatus(row: AbsenceRequest) {
    this.row = row;
    const status = row.status as ABSENCE_REQUEST_STATUS;

    if (status.value == STATUS_ABSENCE.PENDING) {
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
      const message = this.translate.instant("cadastros.absenceRequests.title.confirmReturnStatus");

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

  setRequestStatus(status: string) {
    this.loading = true;

    let requestStatus: STATUS_ABSENCE;

    if (status == "accepted") {
      requestStatus = STATUS_ABSENCE.ACCEPTED;
      this.closeDialog();
    } else if (status == "rejected") {
      requestStatus = STATUS_ABSENCE.REJECTED;
      this.closeDialog();
    } else if (status == "pending") {
      requestStatus = STATUS_ABSENCE.PENDING;
    }

    this.absenceRequestsService
      .setStatus(this.row._id, requestStatus)
      .then(async () => {
        this.toastr.success(
          this.translate.instant("mensagem.sucesso.alterado"),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        await this.getAll();
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
        this.loading = false;
      });
  }

  closeDialog() {
    this.dialog.getDialogById("toggle-status").close(true);
  }

  applyFilter() {
    const filter = this.searchFilter.nativeElement.value;
    this.dataSource.filter = filter;
  }
}
