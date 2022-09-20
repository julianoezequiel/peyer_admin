import { MatSelect } from "@angular/material/select";
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";

import { rowsAnimation } from "../../../../shared/animations";
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from "../../../../shared/confirm-dialog/confirm-dialog.component";
import { ErrorFirebaseService } from "../../../error/services/error-firebase.service";
import { UsuarioService } from "../../services/usuario.service";
import {
  Improvement,
  REQUEST_STATUS,
  STATUS_IMPROVEMENT,
  REQUEST_TYPE,
  TYPES_IMPROVEMENT,
} from "./../../model/improvements/improvements";
import { ImprovementsService } from "./../../services/improvements.service";
import { ImprovementDetailsDialog } from "./improvement-details-dialog/improvement-details-dialog.component";
import moment from "moment";

@Component({
  selector: "app-improvements-list",
  templateUrl: "./improvements-list.component.html",
  styleUrls: ["./improvements-list.component.scss"],
  animations: [rowsAnimation],
})
export class ImprovementsListComponent implements OnInit {
  private subscriptions: Subscription[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<{ improvement: Improvement; name: string }>;
  displayedColumns = [
    "description",
    "name",
    "creationDate",
    "requestStatus",
    "requestType",
    "actions",
  ];

  loading = true;

  data: Improvement[];

  statusColor: string;

  requestTypesList: REQUEST_TYPE[] = [
    new REQUEST_TYPE(TYPES_IMPROVEMENT.ALL),
    new REQUEST_TYPE(TYPES_IMPROVEMENT.CLIENT_RECLAMATION),
    new REQUEST_TYPE(TYPES_IMPROVEMENT.PURCHASE_SUGGESTION),
    new REQUEST_TYPE(TYPES_IMPROVEMENT.SUGGESTION_IMPROVEMENTS),
  ];

  requestStatusList: REQUEST_STATUS[] = [
    new REQUEST_STATUS(STATUS_IMPROVEMENT.ALL),
    new REQUEST_STATUS(STATUS_IMPROVEMENT.PENDING),
    new REQUEST_STATUS(STATUS_IMPROVEMENT.DONE),
    new REQUEST_STATUS(STATUS_IMPROVEMENT.REJECTED),
  ];

  @ViewChild("selectType", { static: true }) selectType: MatSelect;
  @ViewChild("selectStatus", { static: true }) selectStatus: MatSelect;
  @ViewChild("searchFilter", { static: true })
  searchFilter: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private improvementsService: ImprovementsService,
    private errorFB: ErrorFirebaseService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private userService: UsuarioService
  ) {}

  ngOnInit() {
    this.selectStatus.value = STATUS_IMPROVEMENT.ALL;
    this.selectType.value = TYPES_IMPROVEMENT.ALL;

    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
    this.dialog.closeAll();
  }

  add() {
    this.router.navigate(["../improvements/improvement"], {
      relativeTo: this.activatedRoute,
    });
  }

  edit(improvements: Improvement) {
    this.router.navigate(["../improvements/improvement/", improvements._id], {
      relativeTo: this.activatedRoute,
    });
  }

  async delete(improvements: Improvement) {
    if (improvements._id) {
      this.improvementsService
        .delete(improvements)
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

    const subList = this.improvementsService
      .getAllByFilters(this.selectType.value, this.selectStatus.value)
      .subscribe(
        (data) => {
          let improvementsList: { improvement: Improvement; name: string }[] =
            [];

          data.forEach(async (e) => {
            let improvement = e.payload.doc.data() as Improvement;
            improvement._id = e.payload.doc.id;

            improvement.requestStatus = new REQUEST_STATUS(null).getByValue(
              improvement.requestStatus
            );
            
            improvement.requestType = new REQUEST_TYPE(null).getByValue(
              improvement.requestType
            );

            let name = "";

            const authorSub = await this.userService
              .getById(improvement.userID)
              .valueChanges()
              .subscribe(async (value) => {
                name = value.displayName;

                improvementsList.push({ improvement: improvement, name: name });

                // refresh data
                this.dataSource.filter = "";
              });

            this.subscriptions.push(authorSub);
          });

          this.initTable(improvementsList);

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
      if (sort == "description") {
        return data.improvement.description.toLowerCase();
      } else if (sort == "name") {
        return data.name.toLowerCase();
      } else if (sort == "creationDate") {
        return moment(data.improvement.creationDate, ["DD/MM/YYYY"]).unix();
      }
    };

    // Custom filter when nested object
    this.dataSource.filterPredicate = (data, filter) => {
      filter = filter.toLowerCase().trim();

      return (
        data.name.toLowerCase().includes(filter) ||
        data.improvement.creationDate.includes(filter) ||
        data.improvement.description.toLowerCase().includes(filter)
      );
    };
  }

  viewImprovementDetails(row) {
    const dialogRef = this.dialog
      .open(ImprovementDetailsDialog, {
        width: "410px",
        height: "410px",
        data: row,
        panelClass: "improvement-details-dialog",
      })
      .afterClosed()
      .subscribe(() => {
        this.getAll();
      });
  }

  confirmDialog(row: Improvement): void {
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
        case STATUS_IMPROVEMENT.PENDING:
          this.statusColor = "pending";
          break;
        case STATUS_IMPROVEMENT.DONE:
          this.statusColor = "done";
          break;
        case STATUS_IMPROVEMENT.REJECTED:
          this.statusColor = "rejected";
          break;
        case STATUS_IMPROVEMENT.ALL:
          this.statusColor = "all";
          break;
      }
    }
  }

  getStatusColorCell(status) {
    if (status) {
      switch (status) {
        case STATUS_IMPROVEMENT.PENDING:
          return "pending";
        case STATUS_IMPROVEMENT.DONE:
          return "done";
        case STATUS_IMPROVEMENT.REJECTED:
          return "rejected";
      }
    }
  }

  applyFilter() {
    const filter = this.searchFilter.nativeElement.value;
    this.dataSource.filter = filter;
  }
}
