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
  Improvement,
  REQUEST_STATUS,
  REQUEST_TYPE,
  STATUS_IMPROVEMENT,
  TYPES_IMPROVEMENT,
} from './../../model/improvements/improvements';
import { ImprovementsService } from './../../services/improvements.service';

/**
 * @description !!! Component not used, but not deleted !!!
 * * This component is responsible for inserting and changing an Improvement (removed from the routing file, these features are only available in the APP)
 * 
 */
@Component({
  selector: "app-improvements-registration",
  templateUrl: "./improvements-registration.component.html",
  styleUrls: ["./improvements-registration.component.scss"],
})
export class ImprovementsRegistrationComponent implements OnInit {
  improvementData: Improvement = new Improvement();
  private subscriptions: Subscription[] = [];

  improvementsForm: FormGroup;

  pageTitle: string;
  disableBtn = false;

  name: string;
  statusColor: string;

  isNewRecord = true;

  requestTypesList: REQUEST_TYPE[] = [
    new REQUEST_TYPE(TYPES_IMPROVEMENT.CLIENT_RECLAMATION),
    new REQUEST_TYPE(TYPES_IMPROVEMENT.PURCHASE_SUGGESTION),
    new REQUEST_TYPE(TYPES_IMPROVEMENT.SUGGESTION_IMPROVEMENTS),
  ];

  requestStatusList: REQUEST_STATUS[] = [
    new REQUEST_STATUS(STATUS_IMPROVEMENT.PENDING),
    new REQUEST_STATUS(STATUS_IMPROVEMENT.DONE),
    new REQUEST_STATUS(STATUS_IMPROVEMENT.REJECTED),
  ];

  @ViewChild("selectType") selectType: MatSelect;
  @ViewChild("selectStatus") selectStatus: MatSelect;

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private userService: UsuarioService,
    private improvementsService: ImprovementsService,
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
          
          const improvementSub = this.improvementsService
            .getById(id)
            .valueChanges()
            .subscribe(async (value) => {
              this.improvementData = value;
              this.improvementData._id = id;

              const userSub = await this.userService
                .getById(this.improvementData.userID)
                .valueChanges()
                .subscribe(async (value) => {
                  this.name = value.displayName;
                });

              this.subscriptions.push(userSub);

              this.selectStatus.value = value.requestStatus;
              this.selectStatus.selectionChange.emit(this.selectStatus.value);
              this.selectType.value = value.requestType;

              this.createForm();
            });

          this.subscriptions.push(improvementSub);
        } else {
          this.isNewRecord = true;

          const userLocal = (await JSON.parse(
            localStorage.getItem("user_firebase")
          )) as UserFirebase;

          this.improvementData.userID = userLocal.uid;
          this.name = userLocal.displayName;

          this.selectStatus.value = STATUS_IMPROVEMENT.PENDING;
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
    const controls = this.improvementsForm.controls;

    /* check form */
    if (this.improvementsForm.invalid) {
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

    const improvement: Improvement = this.improvementsForm.value as Improvement;
    improvement._id = this.improvementData._id;
    improvement.userID = this.improvementData.userID;
    improvement.creationDate = this.improvementData.creationDate;

    /* check request type */
    if (!this.selectType.value) {
      this.toastr.warning(
        this.translate.instant("cadastros.improvements.msg.selectRequestType"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    } else {
      improvement.requestType = this.selectType.value;
    }

    /* check request status */
    if (!this.selectStatus.value) {
      this.toastr.warning(
        this.translate.instant("cadastros.improvements.msg.selectStatus"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    } else {
      improvement.requestStatus = this.selectStatus.value;
    }

    this.disableBtn = true;
    if (improvement._id) {
      this.updateImprovement(improvement);
    } else {
      this.addImprovement(improvement);
    }
  }

  createForm() {
    this.improvementsForm = this.fb.group({
      description: [this.improvementData.description, Validators.required],
      creationDate: [
        moment(this.improvementData.creationDate, "DD/MM/YYYY"),
        Validators.required,
      ],
    });
  }

  addImprovement(improvement: Improvement) {
    this.improvementsService
      .create(improvement)
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
        this.router.navigate(["../improvements"], {});
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

  updateImprovement(improvement: Improvement) {
    this.improvementsService
      .update(improvement, this.improvementData)
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
        this.router.navigate(["../improvements"], {});
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
        case STATUS_IMPROVEMENT.PENDING:
          this.statusColor = "pending";
          break;
        case STATUS_IMPROVEMENT.DONE:
          this.statusColor = "done";
          break;
        case STATUS_IMPROVEMENT.REJECTED:
          this.statusColor = "rejected";
          break;
      }
    }
  }

  goToList() {
    this.router.navigate(["../improvements"], {});
  }
}
