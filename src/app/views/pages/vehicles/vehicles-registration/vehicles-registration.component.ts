import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/internal/Subscription';

import { VehicleService } from '../../services/vehicle.service';
import { UserFirebase } from './../../model/user/userfirebase.model';
import { Vehicle } from './../../model/vehicle/vehicle.model';
import { UsuarioService } from './../../services/usuario.service';

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
    driverID: "",
    licensePlate: "",
    category: "",
  };

  private subscriptions: Subscription[] = [];

  vehicleForm: FormGroup;

  pageTitle: string;
  disableBtn = false;
  disableDriver = true;

  driversList: UserFirebase[] = [];

  @ViewChild("selectDriver") selectDriver: MatSelect;

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

        if (id && id.length > 0) {
          const vehicleSub = this.vehicleService
            .getById(id)
            .valueChanges()
            .subscribe(async (value) => {
              this.vehicleData = value;
              this.vehicleData._id = id;

              if (this.vehicleData.driverID && this.vehicleData.onRoute) {

                this.disableDriver = false;

                const driverSub = await this.userService
                  .getById(this.vehicleData.driverID)
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
              } else {
                this.disableDriver = true;
              }

              this.createForm();
            });

          this.subscriptions.push(vehicleSub);
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

  async onSubmit() {
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

    /* check driver */
    if (!this.selectDriver.value && vehicle.onRoute) {
      this.toastr.warning(
        this.translate.instant("cadastros.vehicles.msg.noDriverWithRoute"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    } 
    
    if (!vehicle.onRoute) { 
      vehicle.driverID = "";
    } else {
      vehicle.driverID = this.selectDriver.value.uid;
    }

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
      licensePlate: [this.vehicleData.licensePlate, Validators.required],
      category: [this.vehicleData.category, Validators.required],
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
      .finally(() => (this.disableBtn = false));
  }

  updateVehicle(vehicle: Vehicle) {
    this.vehicleService
      .update(vehicle, this.vehicleData)
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
      .finally(() => (this.disableBtn = false));
  }

  applyFilter(driver: UserFirebase, filter: string) {
    filter = filter.toLowerCase();

    return (
      driver.displayName.toLowerCase().includes(filter) ||
      driver.mainContact.toLowerCase().includes(filter) ||
      driver.secondaryContact.toLowerCase().includes(filter)
    );
  }
}
