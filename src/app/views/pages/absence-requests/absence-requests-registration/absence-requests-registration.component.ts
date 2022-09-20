import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

import { UserFirebase } from '../../model/user/userfirebase.model';
import { UsuarioService } from '../../services/usuario.service';
import {
  ABSENCE_REQUEST_STATUS,
  AbsenceRequest,
  CAUSE,
  CAUSE_TYPE,
  PERIOD,
  PERIOD_TYPE,
  STATUS_ABSENCE,
} from './../../model/absence-requests/absence-requests';
import { AbsenceRequestsService } from './../../services/absence-requests.service';

/**
 * @description !!! Component not used, but not deleted !!!
 * * This component is responsible for inserting and changing an Improvement (removed from the routing file, these features are only available in the APP)
 * 
 */
@Component({
  selector: "app-absence-requests-registration",
  templateUrl: "./absence-requests-registration.component.html",
  styleUrls: ["./absence-requests-registration.component.scss"],
})
export class AbsenceRequestsRegistrationComponent implements OnInit {
  requestData: AbsenceRequest = new AbsenceRequest();
  private subscriptions: Subscription[] = [];

  requestForm: FormGroup;

  pageTitle: string;
  disableBtn = false;

  name: string;
  statusColor: string;

  isNewRecord = true;

  causeTypesList: CAUSE_TYPE[] = [
    new CAUSE_TYPE(CAUSE.VACATION),
    new CAUSE_TYPE(CAUSE.FAMILY),
    new CAUSE_TYPE(CAUSE.SICK_ACCIDENT),
    new CAUSE_TYPE(CAUSE.MILITARY),
    new CAUSE_TYPE(CAUSE.OTHER),
  ];

  periodTypesList: PERIOD_TYPE[] = [
    new PERIOD_TYPE(PERIOD.MORNING),
    new PERIOD_TYPE(PERIOD.AFTERNOON),
    new PERIOD_TYPE(PERIOD.WHOLE_DAY),
  ];

  requestStatusList: ABSENCE_REQUEST_STATUS[] = [
    new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.PENDING),
    new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.ACCEPTED),
    new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.REJECTED),
  ];

  @ViewChild("selectCause") selectCause: MatSelect;
  @ViewChild("selectPeriod") selectPeriod: MatSelect;
  @ViewChild("selectStatus") selectStatus: MatSelect;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private userService: UsuarioService,
    private absenceRequestsService: AbsenceRequestsService,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.createForm();

    const routeSubscription = await this.activatedRoute.params.subscribe(
      async (params) => {
        const id = params.id;

        this.pageTitle = id ? "titulo.editarRegistro" : "titulo.novoRegistro";

        if (id && id.length > 0) {
          this.isNewRecord = false;

          const requestSub = this.absenceRequestsService
            .getById(id)
            .valueChanges()
            .subscribe(async (value) => {
              this.requestData = value;
              this.requestData._id = id;

              const userSub = await this.userService
                .getById(this.requestData.userID)
                .valueChanges()
                .subscribe(async (value) => {
                  this.name = value.displayName;
                });

              this.subscriptions.push(userSub);

              this.selectStatus.value = value.status;
              this.selectStatus.selectionChange.emit(this.selectStatus.value);

              this.selectCause.value = value.cause;
              this.selectPeriod.value = value.period;

              this.createForm();
            });

          this.subscriptions.push(requestSub);
        } else {
          this.isNewRecord = true;

          const userLocal = (await JSON.parse(
            localStorage.getItem("user_firebase")
          )) as UserFirebase;

          this.requestData.userID = userLocal.uid;
          this.name = userLocal.displayName;

          this.selectStatus.value = STATUS_ABSENCE.PENDING;
          this.selectStatus.selectionChange.emit(this.selectStatus.value);
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

  async onSubmit() {
    const controls = this.requestForm.controls;

    /* check form */
    if (this.requestForm.invalid) {
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

    const request: AbsenceRequest = this.requestForm.value as AbsenceRequest;
    request._id = this.requestData._id;
    request.userID = this.requestData.userID;
    request.beginDate = moment(request.beginDate).format("DD/MM/YYYY");
    request.endDate = moment(request.endDate).format("DD/MM/YYYY");

    /* check cause */
    if (!this.selectCause.value) {
      this.toastr.warning(
        this.translate.instant("cadastros.absenceRequests.msg.selectCause"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    } else {
      request.cause = this.selectCause.value;
    }

    /* check period */
    if (!this.selectPeriod.value) {
      this.toastr.warning(
        this.translate.instant("cadastros.absenceRequests.msg.selectPeriod"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    } else {
      request.period = this.selectPeriod.value;
    }

    /* check status */
    if (!this.selectStatus.value) {
      this.toastr.warning(
        this.translate.instant("cadastros.absenceRequests.msg.selectStatus"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    } else {
      request.status = this.selectStatus.value;
    }
    
    this.disableBtn = true;
    if (request._id) {
      this.updateRequest(request);
    } else {
      this.addRequest(request);
    }
  }

  createForm() {
    this.requestForm = this.fb.group({
      beginDate: [
        moment(this.requestData.beginDate, "DD/MM/YYYY"),
        Validators.required,
      ],
      endDate: [
        moment(this.requestData.endDate, "DD/MM/YYYY"),
        Validators.required,
      ],
    });
  }

  addRequest(absenceRequest: AbsenceRequest) {
    this.absenceRequestsService
      .create(absenceRequest)
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

        this.goToList();
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

  updateRequest(absenceRequest: AbsenceRequest) {
    this.absenceRequestsService
      .update(absenceRequest, this.requestData)
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
        this.goToList();
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

  getStatusColor() {
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
      }
    }
  }

  goToList() {
    this.router.navigate(["../absence-requests"], {});
  }
}
