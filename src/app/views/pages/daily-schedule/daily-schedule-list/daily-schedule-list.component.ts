import { VehicleService } from "./../../services/vehicle.service";
import { UsuarioService } from "./../../services/usuario.service";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import {
  ConfirmDialogModel,
  ConfirmDialogComponent,
} from "./../../../../shared/confirm-dialog/confirm-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { concat, Subscription } from "rxjs";
import { ErrorFirebaseService } from "../../../error/services/error-firebase.service";
import { DailySchedule } from "../../model/daily-schedule/dailyschedule.model";
import { TranslateService } from "@ngx-translate/core";
import { rowsAnimation } from "../../../../shared/animations";
import { DailyScheduleService } from "../../services/dailyschedule.service";
import lodash from 'lodash';
import { UserFirebase } from "../../model/user/userfirebase.model";
import { FormControl } from "@angular/forms";
import { MatOptionSelectionChange } from "@angular/material/core";
import moment from "moment";
import { MatDatepickerInputEvent } from "@angular/material/datepicker";
import { debounceTime } from "rxjs/operators";

@Component({
  selector: "app-daily-schedule-list",
  templateUrl: "./daily-schedule-list.component.html",
  styleUrls: ["./daily-schedule-list.component.scss"],
  animations: [rowsAnimation],
})
export class DailyScheduleListComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<{ ds: DailySchedule; driver: string; vehicle: string }>;
  displayedColumns = [
    "driver",
    "vehicle",
    "from",
    "to",
    "beginDate",
    "time",
    "actions",
  ];

  data: DailySchedule[];

  dataEmpty = true;
  loading = true;

  driverList: UserFirebase[] = []
  driverFormControl: FormControl = new FormControl(null)
  dateFormControl: FormControl = new FormControl()

  @ViewChild("searchFilter", { static: true }) searchFilter: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private errorFB: ErrorFirebaseService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private dailyScheduleService: DailyScheduleService,
    private userService: UsuarioService,
    private vehicleService: VehicleService
  ) { }

  async ngOnInit() {

    this.getAll();
    this.driverList = await this.userService.getDrivers()
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
    this.dialog.closeAll();
  }

  async getAll() {

    this.searchFilter.nativeElement.value = "";

    let data = "";

    if (this.dateFormControl.value && this.dateFormControl.value.isValid()) {
    
      let arr = moment(this.dateFormControl.value).format().split("-", 3)
      arr[2] = arr[2].split("T")[0]
  
      data = arr[2] + "/" + arr[1] + "/" + arr[0]
    }


    const subList = await this.dailyScheduleService.findByDriverAndDate(null, data).subscribe(
      (data) => {
        let list: { ds: DailySchedule; driver: string; vehicle: string }[] = [];

        data.forEach(async (e) => {
          let ds = e.payload.doc.data() as DailySchedule;
          ds._id = e.payload.doc.id;

          ds.beginTime = `${ds.beginTime.substring(0, 2)}:${ds.beginTime.substring(2)}`

          let driver = "";
          let vehicle = "";

          const driverSub = await this.userService
            .getById(ds.driverID)
            .valueChanges()
            .subscribe(async (value) => {
              driver = value.displayName;

              // refresh data
              this.dataSource.filter = "";
            });

          this.subscriptions.push(driverSub);

          const vehicleSub = await this.vehicleService
            .getById(ds.vehicleID)
            .valueChanges()
            .subscribe(async (value) => {

              let alreadyExistsInList = list.length == 0 ? false : list.some((f) => lodash.isEqual(f.ds, ds));

              if (!alreadyExistsInList) {
                vehicle = value.name;

                list.push({ ds: ds, driver: driver, vehicle: vehicle });

                // refresh data
                this.dataSource.filter = "";
              }
            });

          this.subscriptions.push(vehicleSub);
        });

        this.dataEmpty = list.length == 0;

        this.initTable(list);

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
      if (sort == "vehicle") {
        return data.vehicle.toLowerCase();
      } else if (sort == "time") {
        return moment(data.ds.beginTime, ["HH:MM"]).unix();
      } else if (sort == "from") {
        return data.ds.departure.toLowerCase();
      } else if (sort == "to") {
        return data.ds.destination.toLowerCase();
      }
    };

    // Custom filter when nested object
    this.dataSource.filterPredicate = (data, filter) => {
      filter = filter.toLowerCase().trim();

      return (
        data.driver.toLowerCase().includes(filter) ||
        data.vehicle.toLowerCase().includes(filter) ||
        data.ds.beginDate.includes(filter) ||
        data.ds.beginTime.includes(filter) ||
        data.ds.departure.toLowerCase().includes(filter) ||
        data.ds.destination.toLowerCase().includes(filter)
      );
    };
  }

  add() {
    this.router.navigate(["../daily-schedule/route-plan"], {
      relativeTo: this.activatedRoute,
    });
  }

  edit(ds: DailySchedule) {
    this.router.navigate(["../daily-schedule/route-plan/", ds._id], {
      relativeTo: this.activatedRoute,
    });
  }

  confirmDialog(row): void {
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

  async delete(vehicle) {
    if (vehicle._id) {
      this.dailyScheduleService
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

  applyFilter() {
    this.dataSource.filter = this.searchFilter.nativeElement.value.toLowerCase().trim();
  }

  driverFilter(driver: UserFirebase, filter: string) {

    return driver.displayName.toLowerCase().includes(filter)

  }


  async filterByDriverAndDate(event) {

    this.searchFilter.nativeElement.value = "";

    if (event instanceof MatDatepickerInputEvent || event.isUserInput) {

      let data = null;

      if (moment(this.dateFormControl.value).isValid()) {

        let arr = moment(this.dateFormControl.value).format().split("-", 3)
        arr[2] = arr[2].split("T")[0]
  
        data = arr[2] + "/" + arr[1] + "/" + arr[0];
      }

      let driver = event instanceof MatOptionSelectionChange ? event.source.value.uid : (this.driverFormControl.value ? this.driverFormControl.value.uid : null)

      const subList = await this.dailyScheduleService.findByDriverAndDate(driver, data).subscribe(
        (data) => {

          let list: { ds: DailySchedule; driver: string; vehicle: string }[] = [];

          data.forEach(async (e) => {
            let ds = e.payload.doc.data() as DailySchedule;
            ds._id = e.payload.doc.id;

            ds.beginTime = `${ds.beginTime.substring(0, 2)}:${ds.beginTime.substring(2)}`

            let driver = "";
            let vehicle = "";

            const driverSub = await this.userService
              .getById(ds.driverID)
              .valueChanges()
              .subscribe(async (value) => {
                driver = value.displayName;

                // refresh data
                this.dataSource.filter = "";
              });

            this.subscriptions.push(driverSub);

            const vehicleSub = await this.vehicleService
              .getById(ds.vehicleID)
              .valueChanges()
              .subscribe(async (value) => {

                let alreadyExistsInList = list.length == 0 ? false : list.some((f) => lodash.isEqual(f.ds, ds));

                if (!alreadyExistsInList) {
                  vehicle = value.name;

                  list.push({ ds: ds, driver: driver, vehicle: vehicle });

                  // refresh data
                  this.dataSource.filter = "";
                }
              });

            this.subscriptions.push(vehicleSub);
          });

          this.dataEmpty = list.length == 0;

          this.initTable(list);

          this.loading = false;
        },

        (error) => {
          console.log(error);
          return this.errorFB.getErrorByCode(error);
        }
      );

      this.subscriptions.push(subList);

    }
  }
}
