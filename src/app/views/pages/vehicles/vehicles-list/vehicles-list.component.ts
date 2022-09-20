import { UsuarioService } from "./../../services/usuario.service";
import { Subscription } from "rxjs/internal/Subscription";
import { ToastrService } from "ngx-toastr";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogModel,
  ConfirmDialogComponent,
} from "./../../../../shared/confirm-dialog/confirm-dialog.component";
import { TranslateService } from "@ngx-translate/core";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";

import { Vehicle } from "../../model/vehicle/vehicle.model";
import { VehicleService } from "../../services/vehicle.service";
import { rowsAnimation } from "./../../../../shared/animations";
import { ErrorFirebaseService } from "./../../../error/services/error-firebase.service";
import { MatSelect } from "@angular/material/select";

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

  dataSource: MatTableDataSource<{ vehicle: Vehicle; driver: string }>;
  displayedColumns = ["name", "status", "driver", "licensePlate", "acoes"];

  loading = true;

  data: Vehicle[];

  statusList = [
    {
      label: "cadastros.vehicles.status.all",
      value: 0,
    },
    {
      label: "cadastros.vehicles.status.onRoute",
      value: 1,
    },
    {
      label: "cadastros.vehicles.status.onGarage",
      value: 2,
    },
  ];

  @ViewChild("selectStatus", { static: true }) selectStatus: MatSelect;
  @ViewChild("searchFilter", { static: true }) searchFilter: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private vehiclesService: VehicleService,
    private userService: UsuarioService,
    private errorFB: ErrorFirebaseService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.selectStatus.value = 0;

    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
    this.dialog.closeAll();
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

    this.searchFilter.nativeElement.value = "";

    let getVehicles = this.vehiclesService.getAll();

    if (this.selectStatus.value == 1 || this.selectStatus.value == 2) {
      let onRoute: boolean = this.selectStatus.value == 1;

      getVehicles = this.vehiclesService.getAllByFilters(onRoute);
    }

    const subList = await getVehicles.subscribe(
      (data) => {
        let vehiclesList: { vehicle: Vehicle; driver: string }[] = [];

        data.forEach(async (e) => {
          let vehicle = e.payload.doc.data() as Vehicle;
          vehicle._id = e.payload.doc.id;

          let driver = "";

          if (vehicle.driverID && vehicle.onRoute) {
            const driverSub = await this.userService
              .getById(vehicle.driverID)
              .valueChanges()
              .subscribe(async (value) => {
                driver = value.displayName;

                vehiclesList.push({ vehicle: vehicle, driver: driver });

                // refresh data
                this.dataSource.filter = " ";
              });

            // refresh data
            this.dataSource.filter = " ";

            this.subscriptions.push(driverSub);
          } else {
            vehiclesList.push({ vehicle: vehicle, driver: driver });
          }
        });

        this.initTable(vehiclesList);

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
        return data.vehicle.name.toLowerCase();
      } else if (sort == "status") {
        return data.vehicle.onRoute.toString();
      } else if (sort == "driver") {
        return data.driver.toLowerCase();
      } else if (sort == "licensePlate") {
        return data.vehicle.licensePlate.toLowerCase();
      }
    };

    // Custom filter when nested object
    this.dataSource.filterPredicate = (data, filter) => {
      filter = filter.toLowerCase().trim();

      return (
        data.vehicle.name.toLowerCase().includes(filter) ||
        data.vehicle.licensePlate.toLowerCase().includes(filter) ||
        data.driver.toLowerCase().includes(filter)
      );
    };
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

  applyFilter() {
    this.dataSource.filter = this.searchFilter.nativeElement.value;
  }
}
