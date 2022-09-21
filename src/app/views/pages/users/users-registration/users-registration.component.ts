import { Moment } from 'moment';
import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import moment from 'moment';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/internal/Subscription';

import { rowsAnimation } from '../../../../shared/animations';
import { AuthService } from '../../../auth/services/auth.service';
import { EmergencyContacts } from '../../model/user/emergencyContacts.model';
import { UserFirebase } from '../../model/user/userfirebase.model';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: "app-user-registration",
  templateUrl: "./users-registration.component.html",
  styleUrls: ["./users-registration.component.scss"],
  animations: [rowsAnimation],
})
export class UsersRegistrationComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  userForm: FormGroup;
  pageTitle: string;

  // PHOTO AUX
  dataimage: any;
  contentType: any;
  imageFile: any;
  downloadURL: any;
  fileAttr = "Choose File";
  loadingPhoto;
  photoInitial = "";

  maxDate: Date = new Date();

  userData: UserFirebase = {
    uid: "",
    email: "",
    displayName: "",
    photoURL: "",
    password: "",
    jobTitle: "",
    birthDate: "",
    mainContact: "",
    secondaryContact: "",
    permissions: {
      employee: false,
      administrative: false,
      driver: false,
    },
    active: true,
    emergencyContacts: [{ telefone: null, nome: "" }],
  };

  modalRef: BsModalRef;
  newUser = true;
  disableBtn = false;

  emailReadOnly = false;
  emailInit = "";

  passwordReadOnly = false;
  passwordInit = "";

  userActive = false;

  // TABLE EMERGENCY CONTACTS
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  loadingTable: boolean = true;

  dataSourceEC: MatTableDataSource<EmergencyContacts>;
  displayedColumns = ["nome", "telefone", "acoes"];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    public auth: AuthService,
    public translate: TranslateService,
    private angularFireStorage: AngularFireStorage,
    public afAuth: AngularFireAuth,
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService
  ) {}

  async ngOnInit() {
    this.createForm();

    const routeSubscription = await this.activatedRoute.params.subscribe(
      (params) => {
        const id = params.id;

        this.pageTitle = id ? "titulo.editarRegistro" : "titulo.novoRegistro";
        this.newUser = id ? false : true;
        this.emailReadOnly = !this.newUser;
        this.passwordReadOnly = !this.newUser;

        if (id && id.length > 0) {
          const material = this.usuarioService.getById(id).valueChanges();
          const subMaterial = material.subscribe(async (value) => {
            this.userData = value;
            this.userData.uid = id;

            this.userActive = value.active;

            this.emailInit = value.email;
            this.passwordInit = value.password;
            this.photoInitial = value.photoURL;
            //console.log("this.userData", this.userData);

            this.setStatusCheckboxs();
            this.createForm();
            
            if (this.userData.birthDate)
            this.userForm.controls.dataNascimento.setValue(moment(this.userData.birthDate, "DD/MM/YYYY"));

            await this.downloadPhoto(this.userData);
          });

          this.subscriptions.push(subMaterial);
        } else {
          this.userActive = true;
        }
      }
    );

    //console.log("FORM", this.userForm);

    this.subscriptions.push(routeSubscription);
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
    this.downloadURL = null;
  }

  createForm() {
    this.userForm = this.fb.group({
      usuario: [this.userData.displayName, Validators.required],
      email: [this.userData.email, [Validators.required, Validators.email]],
      senha: [
        this.userData.password,
        [Validators.required, Validators.minLength(6)],
      ],
      senha_confirma: [
        this.userData.password,
        [
          Validators.required,
          Validators.minLength(6),
          this.confirmPassValidator("senha"),
        ],
      ],
      cargo: [this.userData.jobTitle, [Validators.required]],
      dataNascimento: [null],
      mainContact: [
        this.userData.mainContact,
        Validators.required,
      ],
      secondaryContact: this.userData.secondaryContact,
      permissao: this.fb.group({
        employee: this.userData.permissions.employee,
        administrative: this.userData.permissions.administrative,
        driver: this.userData.permissions.driver,
      }),
      ativo: [this.userData.active],
      contatosEmergencia: this.buildEmergencyContacts(),
    });
  }

  lockField = false;

  async onSubmit() {
    const controls = this.userForm.controls;

    controls["senha"].updateValueAndValidity();
    controls["senha_confirma"].updateValueAndValidity();

    if (!(controls["dataNascimento"].value as Moment).isValid()) {
      controls["dataNascimento"].setValue(null);
    }

    /* check form */
    if (this.userForm.invalid) {
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

    if (!this.newUser && (!this.emailReadOnly || !this.passwordReadOnly)) {
      this.toastr.warning(
        this.translate.instant("cadastros.usuarios.msg.finalizar-edicao"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    }

    /* check table emergency contacts */
    if (this.checkEmergencyContacts()) {
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

    this.checkPermissions(controls);

    const userFirebase: UserFirebase = this.prepareUser();

    if (userFirebase.uid) {
      this.disableBtn = true;
      let userValid = await this.checkOwnUser(userFirebase).catch(
        () => (this.disableBtn = false)
      );

      if (userValid) {
        this.disableBtn = true;
        let checked = await this.checkPhoto(userFirebase.photoURL);

        this.disableBtn = true;
        let uploaded = await this.uploadPhoto().catch(
          () => (this.disableBtn = false)
        );

        //console.log("Updating...");
        this.disableBtn = true;
        this.updateUser(userFirebase);
      }
    } else {
      this.disableBtn = true;
      let upload = await this.uploadPhoto().catch(
        () => (this.disableBtn = false)
      );

      //console.log("Adding...");
      this.disableBtn = true;
      this.addUser(userFirebase);
    }
  }

  checkPermissions(controls) {
    if (
      !controls.permissao.get("administrative").value &&
      !controls.permissao.get("driver").value
    ) {
      controls.permissao.get("employee").setValue(true);
    }
  }

  async checkOwnUser(user: UserFirebase): Promise<boolean> {
    return this.afAuth.currentUser.then((res) => {
      if (res.uid == user.uid) {
        this.toastr.warning(
          this.translate.instant(
            "cadastros.usuarios.msg.alterar-proprio-usuario"
          ),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        return false;
      } else {
        return true;
      }
    });
  }

  addUser(userFirebase: UserFirebase) {
    this.usuarioService
      .create(userFirebase)
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
        this.router.navigate(["../users"], {});
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

  updateUser(userFirebase: UserFirebase) {
    this.usuarioService
      .update(userFirebase.uid, userFirebase, this.emailInit, this.passwordInit)
      .then((result) => {
        this.toastr.success(
          this.translate.instant("mensagem.sucesso.alterado"),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        this.router.navigate(["../users"], {});
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

  prepareUser(): UserFirebase {
    const controls = this.userForm.controls;

    const birthDate = controls.dataNascimento.value ? moment(controls.dataNascimento.value).format("DD/MM/YYYY") : null;

    const userFirebase: UserFirebase = {
      uid: this.userData.uid,
      displayName: controls.usuario.value,
      email: controls.email.value,
      photoURL: this.userData.photoURL,
      // emailVerified: false,
      password: controls.senha.value,
      jobTitle: controls.cargo.value,
      birthDate: birthDate,
      mainContact: controls.mainContact.value,
      secondaryContact: controls.secondaryContact.value,
      permissions: controls.permissao.value,
      active: controls.ativo.value,
      emergencyContacts: controls.contatosEmergencia.value,
    };

    return userFirebase;
  }

  voltar() {
    this.router.navigate(["../users"], {});
  }

  enableEditField(isEmail: boolean) {
    if (isEmail) {
      this.emailReadOnly = !this.emailReadOnly;
    } else {
      this.passwordReadOnly = !this.passwordReadOnly;
    }
  }

  onToggleChange($event: MatSlideToggleChange) {
    this.userActive = $event.checked;

    this.setStatusCheckboxs();
  }

  setStatusCheckboxs() {
    const status = this.userActive ? "enable" : "disable";
    const permissions = this.userForm.controls.permissao;
    permissions.get("employee")[status]();
    permissions.get("administrative")[status]();
    permissions.get("driver")[status]();
  }

  confirmPassValidator(otherField: string) {
    // campo que será utilizado para validação (ex: 'senha confirmação')
    const validator = (formControl: FormControl) => {
      if (otherField == null) {
        throw new Error("cadastros.campo.obrigatorio");
      }

      // validação para certificar primeiro a inicialização do formulário
      // Pois é possível que o FORMULARIO ou CAMPO ainda não estejam pronto para uso
      if (!formControl.root || !(<FormGroup>formControl.root).controls) {
        return null;
      }

      // campo a ser "comparado" (ex: 'senha')
      const field = (<FormGroup>formControl.root).get(otherField);

      if (!field) {
        throw new Error("cadastros.campo.invalid");
      }

      // comparação
      if (field.value !== formControl.value) {
        return { confirmPassInvalid: true };
      }

      // campo valido
      return null;
    };

    return validator;
  }

  /*---------------------
  |         PHOTO       |
  ----------------------*/
  async uploadPhoto() {
    if (this.imageFile) {
      try {
        //console.log("photoURL", this.userData.photoURL);
        //console.log("imageFile", this.imageFile);

        const storageRef = this.angularFireStorage.ref(this.userData.photoURL);

        const task = storageRef.put(this.imageFile);

        const urlPhoto = (await task.task).ref.fullPath;

        this.userData.photoURL = urlPhoto;
      } catch (error) {
        console.error(error);
      }
    }
  }

  downloadPhoto(userData: UserFirebase) {
    if (userData.photoURL) {
      this.loadingPhoto = true;
      this.downloadURL = this.angularFireStorage
        .ref("/" + userData.photoURL)
        .getDownloadURL()
        .toPromise()
        .finally(() => (this.loadingPhoto = false));
    }
  }

  removePhoto() {
    this.dataimage = null;
    this.userData.photoURL = null;
    this.downloadURL = null;
    this.imageFile = null;
  }

  checkPhoto(urlPhotoForm: string): Promise<any> {
    if (this.photoInitial && this.photoInitial != urlPhotoForm) {
      return new Promise((resolve, reject) => {
        this.usuarioService
          .deletePhotoFromStorage(this.photoInitial)
          .then(() => {
            resolve(true);
          })
          .catch((error) => {
            this.disableBtn = false;
            console.log(error);
            this.toastr.warning(
              error,
              this.translate.instant("cadastros.usuarios.msg.erro.salvar-foto"),
              {
                closeButton: true,
                progressAnimation: "decreasing",
                progressBar: true,
              }
            );
          });
      });
    }
  }

  uploadFileEvt(imgFile: any) {
    if (imgFile.target.files && imgFile.target.files[0]) {
      this.fileAttr = "";
      Array.from(imgFile.target.files).forEach((file: File) => {
        this.fileAttr += file.name;
        this.contentType = file.type;
      });

      this.imageFile = imgFile.target.files[0];

      // HTML5 FileReader API
      let reader = new FileReader();
      reader.onload = (e: any) => {
        let image = new Image();
        image.src = e.target.result;
        image.onload = (rs) => {
          let imgBase64Path = e.target.result;
          this.dataimage = imgBase64Path;
        };
      };
      reader.readAsDataURL(imgFile.target.files[0]);

      let id = Math.random().toString(36).substr(2, 5);

      this.userData.photoURL = `user-images/${id}_${this.imageFile.name}`;
    } else {
      this.fileAttr = "Choose File";
    }
  }
  /*--------- PHOTO ---------*/

  /*--------------------
  | EMERGENCY CONTACTS |
  ---------------------*/
  buildEmergencyContacts() {
    this.loadingTable = true;
    // console.log("BUILDING EMERGENCY CONTACTS...");

    this.dataSourceEC = new MatTableDataSource(this.userData.emergencyContacts);
    this.dataSourceEC.sort = this.sort;
    this.dataSourceEC.paginator = this.paginator;

    let row = this.dataSourceEC.data.map((v) =>
      this.fb.group({
        nome: [v.nome],
        telefone: [v.telefone],
      })
    );

    setTimeout(() => {
      this.loadingTable = false;
    }, 1000);

    return this.fb.array(row);
  }

  addEmergencyContact() {
    const form = this.userForm.get("contatosEmergencia") as FormArray;

    form.push(
      this.fb.group({
        nome: [""],
        telefone: [null],
      })
    );

    this.dataSourceEC.data.push({ nome: "", telefone: null });
    this.dataSourceEC.filter = "";

    //console.log("FORM", this.userForm);
    //console.log("DATA SOURCE", this.dataSourceEC.data);
  }

  removeEmergencyContact(template) {
    this.modalRef = this.modalService.show(template, {
      class: "modal-dialog-centered modal-sm",
    });
  }

  /* return true if invalid */
  checkEmergencyContacts(): boolean {
    const controls = this.userForm.controls;

    let formArray = controls.contatosEmergencia as FormArray;

    let isInvalid: boolean;

    formArray.value.forEach((x) => {
      if (!x.nome || this.validPhoneNumber(x.telefone)) {
        isInvalid = true;
      }
    });

    return isInvalid;
  }

  validPhoneNumber(field: string) {
    if (
      !field ||
      (field && this.phoneWithoutFormatting(field).length < 9) ||
      this.findByPhone(field)
    ) {
      return true;
    }
  }

  /* search existing phone numbers */
  findByPhone(field) {
    let countEquals = 0;
    let exist = false;

    this.dataSourceEC.data.forEach((x) => {
      if (x.telefone == field) {
        countEquals = countEquals + 1;
      }
    });

    // 'if = 1 || 0' - suppose the field is itself, so it doesn't exist
    if (countEquals > 1) {
      exist = true;
    }

    return exist;
  }

  onChangeField(row, field, isPhoneNumber) {
    if (isPhoneNumber) {
      row.telefone = field as Number;
    } else {
      row.nome = field as String;
    }

    const form = this.userForm.get("contatosEmergencia") as FormArray;
    form.clear();

    let list = this.dataSourceEC.data.map((v) =>
      this.fb.group({
        nome: [v.nome],
        telefone: [v.telefone],
      })
    );

    list.forEach((x) => {
      form.push(x);
    });
  }

  /* return phone number without formatting */
  phoneWithoutFormatting(field: string) {
    return field.replace(/[-() ]/g, "");
  }

  /* returns error message (from i18n) according to field */
  getErrorPhone(field) {
    if (!field) {
      return "cadastros.campo.obrigatorio";
    }

    if (field && this.phoneWithoutFormatting(field).length < 9) {
      return "cadastros.campo.formatoInvalido";
    }

    if (this.findByPhone(field)) {
      return "cadastros.campo.existe";
    }
  }

  confirm(row): void {
    this.modalRef?.hide();

    if (this.checkEmergencyContacts()) {
      this.toastr.warning(
        this.translate.instant("cadastros.campo.existeInvalidos"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
    } else {
      const form = this.userForm.get("contatosEmergencia") as FormArray;

      let index = null;

      form.value.forEach((x, i) => {
        if (x.telfone === row.telefone || x.nome == row.nome) {
          index = i;
        }
      });

      form.removeAt(index);
      this.dataSourceEC.data.splice(index, 1);
      this.dataSourceEC.filter = "";
    }
  }
  /*----- EMERGENCY CONTACTS -----*/
}
