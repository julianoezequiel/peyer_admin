import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MatSelectChange } from "@angular/material/select";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs/internal/Subscription";

import { UserFirebase } from "./../../model/user/userfirebase.model";
import { Vehicle } from "./../../model/vehicle/vehicle.model";
import { UsuarioService } from "./../../services/usuario.service";
import { VehicleService } from "../../services/vehicle.service";
import { MatOptionSelectionChange } from "@angular/material/core";
import moment from "moment";

@Component({
  selector: "app-vehicles-registration",
  templateUrl: "./vehicles-registration.component.html",
  styleUrls: ["./vehicles-registration.component.scss"],
})
export class VehiclesRegistrationComponent implements OnInit, OnDestroy {
  vehicleData: Vehicle = {
    _id: "",
    name: "",
    onRoute: false,
    lastDriver: {
      uid: "",
      displayName: "",
      contact: "",
    },
    licensePlate: "",
    category: "",
    totalWeight: "",
    usefulLoad: "",
    //updateDate: moment(new Date()).format("DD/MM/YYYY HH:mm")
  };

  private subscriptions: Subscription[] = [];

  vehicleForm: FormGroup;

  pageTitle: string;
  newVehicle = true;
  disableBtn = false;

  driversList: UserFirebase[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private userService: UsuarioService,
    private vehicleService: VehicleService,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.createForm();

    this.driversList = await this.userService.getDrivers();

    const routeSubscription = await this.activatedRoute.params.subscribe(
      (params) => {
        const id = params.id;

        this.pageTitle = id ? "titulo.editarRegistro" : "titulo.novoRegistro";
        this.newVehicle = id ? false : true;

        if (id && id.length > 0) {
          const material = this.vehicleService.getById(id).valueChanges();
          const subMaterial = material.subscribe(async (value) => {
            this.vehicleData = value;
            this.vehicleData._id = id;

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
    this.router.navigate(["../vehicles"], {});
  }

  onSubmit() {
    const controls = this.vehicleForm.controls;

    /* check form */
    if (this.vehicleForm.invalid) {
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

    const vehicle: Vehicle = this.vehicleForm.value as Vehicle;
    vehicle._id = this.vehicleData._id;
    //vehicle.updateDate = this.vehicleData.updateDate;

    this.disableBtn = true;
    if (vehicle._id) {
      this.updateVehicle(vehicle);
    } else {
      this.addVehicle(vehicle);
    }
  }

  createForm() {
    this.vehicleForm = this.fb.group({
      name: [this.vehicleData.name, Validators.required],
      onRoute: [this.vehicleData.onRoute],
      lastDriver: this.fb.group({
        id: [this.vehicleData.lastDriver.uid],
        displayName: [this.vehicleData.lastDriver.displayName],
        contact: [this.vehicleData.lastDriver.contact],
      }),
      licensePlate: [this.vehicleData.licensePlate, Validators.required],
      category: [this.vehicleData.category, Validators.required],
      totalWeight: [this.vehicleData.totalWeight, Validators.required],
      usefulLoad: [this.vehicleData.usefulLoad, Validators.required],
    });
  }

  addVehicle(vehicle: Vehicle) {
    this.vehicleService
      .create(vehicle)
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
        this.router.navigate(["../vehicles"], {});
      })
      .catch((error) => {
        this.toastr.warning(error, this.translate.instant("alerta.atencao"), {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
      })
      .finally(() => this.disableBtn = false);
  }

  updateVehicle(vehicle: Vehicle) {
    this.vehicleService
      .update(vehicle)
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
        this.router.navigate(["../vehicles"], {});
      })
      .catch((error) => {
        this.toastr.warning(error, this.translate.instant("alerta.atencao"), {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
      })
      .finally(() => this.disableBtn = false);
  }

  formatNumber(isTotalWeight: boolean) {
    const control = isTotalWeight
      ? this.vehicleForm.controls["totalWeight"]
      : this.vehicleForm.controls["usefulLoad"];

    let value = String(control.value);
    let chars = value.replace(/[^0-9]+/g, "").split("");

    if (!chars.length) {
      //control.setValue("00.0");
    } else if (chars.length == 1) {
      control.setValue(`00.${value}`);
    } else if (chars.length == 2) {
      control.setValue(`0${chars[0]}.${chars[1]}`);
    } else if (chars.length == 3) {
      //control.setValue(`${chars[0]}${chars[1]}.${chars[3]}`);
    }
  }

  onDriverChange(driver, $event: MatOptionSelectionChange) {
    if ($event.source.selected) {
      let lastDriver: UserFirebase = driver
        ? driver
        : { uid: "", displayName: "", contact: "" };
      const controls = this.vehicleForm.controls;

      console.log("driver", driver);
      console.log("event", $event);
      console.log("lastDriver", lastDriver);
      

      controls.lastDriver.get("id").setValue(lastDriver.uid);
      controls.lastDriver.get("displayName").setValue(lastDriver.displayName);
      controls.lastDriver.get("contact").setValue(lastDriver.contact);
    }
  }

  applyFilter(driver: UserFirebase, filter: string) {
    filter = filter.toLowerCase();

    return (
      driver.displayName.toLowerCase().includes(filter) ||
      driver.contact.toLowerCase().includes(filter)
    );
  }
}
