import { Subscription } from 'rxjs/internal/Subscription';
import { ToastrService } from "ngx-toastr";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogModel,
  ConfirmDialogComponent,
} from "./../../../../shared/confirm-dialog/confirm-dialog.component";
import { TranslateService } from "@ngx-translate/core";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";

import { Vehicle } from "../../model/vehicle/vehicle.model";
import { VehicleService } from "../../services/vehicle.service";
import { rowsAnimation } from "./../../../../shared/animations";
import { ErrorFirebaseService } from "./../../../error/services/error-firebase.service";

@Component({
  selector: "app-vehicles-list",
  templateUrl: "./vehicles-list.component.html",
  styleUrls: ["./vehicles-list.component.scss"],
  animations: [rowsAnimation],
})
export class VehiclesListComponent implements OnInit, OnDestroy {

  private subscriptions: Subscription[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<Vehicle>;
  displayedColumns = [
    "name",
    "status",
    "lastDriver",
    "licensePlate",
    "totalWeight",
    "updateDate",
    "acoes",
  ];

  dataEmpty = true;
  loading = true;

  data: Vehicle[];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private vehiclesService: VehicleService,
    private errorFB: ErrorFirebaseService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }

  add() {
    this.router.navigate(["../vehicles/vehicle"], {
      relativeTo: this.activatedRoute,
    });
  }

  edit(vehicle: Vehicle) {
    this.router.navigate(["../vehicles/vehicle/", vehicle._id], {
      relativeTo: this.activatedRoute,
    });
  }

  async delete(vehicle) {
    if (vehicle._id) {
      this.vehiclesService
        .delete(vehicle)
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
    const subList = await this.vehiclesService.getAll().subscribe(
      (data) => {
        let vehiclesList: Vehicle[] = data.map((e) => {
          let vehicle = e.payload.doc.data() as Vehicle;
          vehicle._id = e.payload.doc.id;

          return vehicle;
        });

        this.dataEmpty = vehiclesList.length == 0;

        this.dataSource = new MatTableDataSource(vehiclesList);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        this.loading = false
      },

      (error) => {
        console.log(error);
        return this.errorFB.getErrorByCode(error);
      }
    );

    this.subscriptions.push(subList);
  }

  viewVehicleHistory(row: Vehicle) {
    this.router.navigate([`../vehicles/vehicle/${row._id}/histories`], {
      relativeTo: this.activatedRoute,
    });
  }

  confirmDialog(row): void {
    const message = this.translate.instant(
      row.onRoute
        ? "cadastros.vehicles.msg.deleteVehicleOnRoute"
        : "mensagem.confirmar"
    );

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

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}
