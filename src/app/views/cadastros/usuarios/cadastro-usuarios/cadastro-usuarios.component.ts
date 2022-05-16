import {
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
} from "@angular/core";
import { AngularFireStorage } from "@angular/fire/storage";
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import moment from "moment";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs/internal/Subscription";

import { rowsAnimation } from "../../../../shared/animations";
import { AuthService } from "../../../login/auth.service";
import { UserFirebase } from "../../model/userfirebase.model";
import { UsuarioService } from "../../services/usuario.service";
import { EmergencyContacts } from "./../../model/emergencyContacts.model";

@Component({
  selector: "app-cadastro-usuarios",
  templateUrl: "./cadastro-usuarios.component.html",
  styleUrls: ["./cadastro-usuarios.component.scss"],
  animations: [rowsAnimation],
})
export class CadastroUsuariosComponent implements OnInit, OnDestroy {
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
  //isRemovePhoto = false;
  photoInitial = "";
  //replacePhoto = false;

  maxDate: Date = new Date();

  userData: UserFirebase = {
    uid: "",
    email: "",
    displayName: "",
    photoURL: "",
    emailVerified: true,
    password: "",
    jobTitle: "",
    birthDate: "",
    contact: "",
    permissions: {
      employee: false,
      administrative: false,
      driver: false,
    },
    emergencyContacts: [{ telefone: null, nome: "" }],
  };

  modalRef: BsModalRef;

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
    private changeDetectorRef: ChangeDetectorRef,
    private modalService: BsModalService
  ) {}

  async ngOnInit() {
    this.createForm();

    const routeSubscription = await this.activatedRoute.params.subscribe(
      (params) => {
        const id = params.id;

        this.pageTitle = id ? "titulo.editarRegistro" : "titulo.novoRegistro";

        if (id && id.length > 0) {
          const material = this.usuarioService.read(id).valueChanges();
          const subMaterial = material.subscribe(async (value) => {
            this.userData = value;
            this.userData.uid = id;
            this.photoInitial = value.photoURL;
            //console.log("this.userData", this.userData);

            this.createForm();
            await this.downloadPhoto(this.userData);
          });

          this.subscriptions.push(subMaterial);
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
      dataNascimento: [
        moment(this.userData.birthDate, "DD/MM/YYYY"),
        Validators.required,
      ],
      contato: [
        this.userData.contact,
        Validators.compose([Validators.required]),
      ],
      permissao: this.fb.group({
        employee: this.userData.permissions.employee,
        administrative: this.userData.permissions.administrative,
        driver: this.userData.permissions.driver,
      }),
      contatosEmergencia: this.buildEmergencyContacts(),
    });
  }

  async onSubmit() {
    const controls = this.userForm.controls;
    console.log(controls);

    /* check form */
    if (this.userForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
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
      await this.checkPhoto();
      await this.uploadPhoto();

      console.log("Updating...");
      this.updateUser(userFirebase);
    } else {
      await this.uploadPhoto();

      console.log("Adding...");
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
      });
  }

  updateUser(userFirebase: UserFirebase) {
    this.usuarioService
      .update(userFirebase.uid, userFirebase)
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
      });
  }

  prepareUser(): UserFirebase {
    const controls = this.userForm.controls;
    const userFirebase: UserFirebase = {
      uid: this.userData.uid,
      displayName: controls.usuario.value,
      email: controls.email.value,
      photoURL: this.userData.photoURL,
      emailVerified: false,
      password: controls.senha.value,
      jobTitle: controls.cargo.value,
      birthDate: new Date(controls.dataNascimento.value).toLocaleDateString(),
      contact: controls.contato.value,
      permissions: controls.permissao.value,
      emergencyContacts: controls.contatosEmergencia.value,
    };

    return userFirebase;
  }

  voltar() {
    this.router.navigate(["../users"], {});
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
        console.log("UPLOAD", this.userData.photoURL);

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
      setTimeout(() => {
        this.downloadURL = this.angularFireStorage
          .ref("/" + userData.photoURL)
          .getDownloadURL();

        console.log(this.downloadURL);

        this.loadingPhoto = false;
      }, 2000);
    }
  }

  removePhoto() {
    this.dataimage = null;
    this.userData.photoURL = null;
    this.downloadURL = null;
    this.imageFile = null;
  }

  checkPhoto() {
    if (this.photoInitial) {
      this.usuarioService
        .deletePhotoFromStorage(this.photoInitial)
        .then(() => {})
        .catch((error) => {
          console.log(error);
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

    this.loadingTable = false;
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
