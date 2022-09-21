import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatOptionSelectionChange } from "@angular/material/core";
import { MatSelect } from "@angular/material/select";
import { Router, ActivatedRoute } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import moment from "moment";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";
import { DailySchedule } from "../../model/daily-schedule/dailyschedule.model";
import { UserFirebase } from "../../model/user/userfirebase.model";
import { Vehicle } from "../../model/vehicle/vehicle.model";
import { DailyScheduleService } from "../../services/dailyschedule.service";
import { UsuarioService } from "../../services/usuario.service";
import { VehicleService } from "../../services/vehicle.service";

@Component({
  selector: "app-daily-schedule-registration",
  templateUrl: "./daily-schedule-registration.component.html",
  styleUrls: ["./daily-schedule-registration.component.scss"],
})
export class DailyScheduleRegistrationComponent implements OnInit {
  routeData: DailySchedule = {
    _id: "",
    driverID: "",
    vehicleID: "",
    departure: "",
    destination: "",
    beginDate: "",
    beginTime: "",
    completed: false,
  };

  private subscriptions: Subscription[] = [];

  routeForm: FormGroup;

  pageTitle: string;
  disableBtn = false;

  driversList: UserFirebase[] = [];
  vehiclesList: Vehicle[] = [];

  @ViewChild("selectDriver") selectDriver: MatSelect;
  @ViewChild("selectVehicle") selectVehicle: MatSelect;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private userService: UsuarioService,
    private vehicleService: VehicleService,
    private dailyScheduleService: DailyScheduleService,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.createForm();

    this.driversList = await this.userService.getDrivers();
    this.vehiclesList = await this.vehicleService.vehiclesList();

    const routeSubscription = await this.activatedRoute.params.subscribe(
      (params) => {
        const id = params.id;

        this.pageTitle = id ? "titulo.editarRegistro" : "titulo.novoRegistro";

        if (id && id.length > 0) {
          const material = this.dailyScheduleService.getById(id).valueChanges();
          const subMaterial = material.subscribe(async (value) => {
            this.routeData = value;
            this.routeData._id = id;

            const driverSub = await this.userService
              .getById(this.routeData.driverID)
              .valueChanges()
              .subscribe(async (driver) => {
                this.driversList = this.driversList.map((d) => {
                  if (d.uid == driver.uid) {
                    this.selectDriver.value = driver;
                    return (d = driver);
                  } else {
                    return d;
                  }
                });
              });

            this.subscriptions.push(driverSub);

            const vehicleSub = await this.vehicleService
              .getById(this.routeData.vehicleID)
              .valueChanges()
              .subscribe(async (vehicle: Vehicle) => {
                this.vehiclesList = this.vehiclesList.map((v) => {
                  vehicle._id = this.routeData.vehicleID;

                  if (v._id == vehicle._id) {
                    this.selectVehicle.value = vehicle;
                    return (v = vehicle);
                  } else {
                    return v;
                  }
                });
              });

            this.subscriptions.push(vehicleSub);

            this.createForm();
          });

          this.subscriptions.push(subMaterial);
        }
      }
    );

    this.subscriptions.push(routeSubscription);
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }

  goBack() {
    this.router.navigate(["../daily-schedule"], {});
  }

  createForm() {
    this.routeForm = this.fb.group({
      departure: [this.routeData.departure, Validators.required],
      destination: [this.routeData.destination, Validators.required],
      beginDate: [
        moment(this.routeData.beginDate, "DD/MM/YYYY"),
        Validators.required,
      ],
      beginTime: [this.routeData.beginTime],
    });
  }

  applyFilterDriver(driver: UserFirebase, filter: string) {
    filter = filter.toLowerCase();

    return driver.displayName.toLowerCase().includes(filter);
  }

  vehicleFilter(vehicle: Vehicle, filter: string) {
    filter = filter.toLowerCase();

    return vehicle.name.toLowerCase().includes(filter);
  }

  onSubmit() {
    const controls = this.routeForm.controls;

    /* check form */
    if (this.routeForm.invalid) {
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
      });
      this.toastr.warning(
        this.translate.instant("cadastros.campo.existeInvalidos"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    }

    const ds: DailySchedule = this.routeForm.value as DailySchedule;
    ds._id = this.routeData._id;
    ds.beginDate = moment(ds.beginDate).format("DD/MM/YYYY");

    /* check driver/vehicle */
    if (!this.selectDriver.value || !this.selectVehicle.value) {
      this.toastr.warning(
        this.translate.instant("cadastros.route.msg.noDriverOrVehicle"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    } else {
      ds.driverID = this.selectDriver.value.uid;
      ds.vehicleID = this.selectVehicle.value._id;
    }

    this.disableBtn = true;
    if (ds._id) {
      this.updateRoute(ds);
    } else {
      this.addRoute(ds);
    }
  }

  addRoute(ds: DailySchedule) {
    this.dailyScheduleService
      .create(ds)
      .then((x) => {
        this.toastr.success(
          this.translate.instant("mensagem.sucesso.adicionado"),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        this.router.navigate(["../daily-schedule"], {});
      })
      .catch((error) => {
        this.toastr.warning(error, this.translate.instant("alerta.atencao"), {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
      })
      .finally(() => (this.disableBtn = false));
  }

  updateRoute(ds: DailySchedule) {
    console.log(ds);
    console.log(this.routeData);

    this.dailyScheduleService
      .update(ds, this.routeData)
      .then((x) => {
        this.toastr.success(
          this.translate.instant("mensagem.sucesso.alterado"),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        this.router.navigate(["../daily-schedule"], {});
      })
      .catch((error) => {
        this.toastr.warning(error, this.translate.instant("alerta.atencao"), {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
      })
      .finally(() => (this.disableBtn = false));
  }
}
