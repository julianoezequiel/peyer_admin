import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs/internal/Subscription';

import { AuthService } from '../../../login/auth.service';
import { UserFirebase } from '../../../login/userfirebase.model';
import { UsuarioService } from '../../services/usuario.service';
import { EmergencyContacts } from './../../model/emergencyContacts.model';
import { rowsAnimation } from './animations';

@Component({
  selector: "app-cadastro-usuarios",
  templateUrl: "./cadastro-usuarios.component.html",
  styleUrls: ["./cadastro-usuarios.component.scss"],
  animations: [rowsAnimation],
})
export class CadastroUsuariosComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  userForm: FormGroup;

  // PHOTO AUX
  dataimage: any;
  contentType: any;
  imageFile: any;
  downloadURL: any;
  fileAttr = "Choose File";

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

  ngOnInit(): void {
    this.createForm();

    const routeSubscription = this.activatedRoute.params.subscribe((params) => {
      const id = params.id;
      if (id && id.length > 0) {
        const material = this.usuarioService.read(id).valueChanges();
        material.subscribe((value) => {
          this.userData = value;
          this.userData.uid = id;
          console.log("this.userData", this.userData);

          this.createForm();
          this.downloadPhoto(this.userData);
        });
      }
    });

    console.log("FORM", this.userForm);

    this.subscriptions.push(routeSubscription);
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
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
        "",
        [
          Validators.required,
          Validators.minLength(6),
          this.confirmPassValidator("senha"),
        ],
      ],
      cargo: [this.userData.jobTitle, [Validators.required]],
      dataNascimento: [
        new Date(this.userData.birthDate),
        [Validators.required],
      ],
      permissao: this.fb.group({
        employee: this.userData.permissions.employee,
        administrative: this.userData.permissions.administrative,
        driver: this.userData.permissions.driver,
      }),
      contatosEmergencia: this.buildEmergencyContacts(),
    });
  }

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

    console.log("FORM", this.userForm);
    console.log("DATA SOURCE", this.dataSourceEC.data);
  }

  removeEmergencyContact(template) {
    this.modalRef = this.modalService.show(template, {class: 'modal-dialog-centered modal-sm', });
  }

  confirm(row): void {
    this.modalRef?.hide();

    if (this.checkEmergencyContacts()) {
      this.toastr.warning(
        this.translate.instant("cadastros.campo.existe-invalidos"),
        this.translate.instant("alerta.title.atencao"),
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
        this.translate.instant("cadastros.campo.existe-invalidos"),
        this.translate.instant("alerta.title.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    }

    const userFirebase: UserFirebase = this.prepareUser();

    console.log("CONTROLS", controls);
    console.log("USER", userFirebase);

    await this.uploadPhoto();

    if (userFirebase.uid) {
      this.updateUser(userFirebase);
    } else {
      this.addUser(userFirebase);
    }
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
      return "cadastros.campo.formato-invalido";
    }

    if (this.findByPhone(field)) {
      return "cadastros.campo.existe";
    }
  }

  addUser(userFirebase: UserFirebase) {
    this.auth
      .SignUp(userFirebase)
      .then((result) => {
        userFirebase.uid = result.uid;
        this.toastr.success(
          this.translate.instant("cadastros.usuarios.msg.sucesso", {
            value: userFirebase.email,
          }),
          this.translate.instant("alerta.title.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        this.updateUser(userFirebase);
      })
      .catch((error) => {
        this.toastr.warning(
          error,
          this.translate.instant("alerta.title.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
      });
  }

  excluir(userFirebase: UserFirebase) {
    this.usuarioService
      .delete(userFirebase.uid)
      .then(() => {
        this.toastr.success(
          this.translate.instant("cadastros.usuarios.msg.exclusao"),
          this.translate.instant("alerta.title.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        this.router.navigate(["../lista-de-usuario"], {});
      })
      .catch((error) => {
        this.toastr.warning(
          error,
          this.translate.instant("alerta.title.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
      });
  }

  updateUser(userFirebase: UserFirebase) {
    this.usuarioService
      .update(userFirebase.uid, userFirebase)
      .then((result) => {
        this.toastr.success(
          this.translate.instant("cadastros.usuarios.msg.sucesso", {
            value: userFirebase.email,
          }),
          this.translate.instant("alerta.title.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        this.router.navigate(["../lista-de-usuario"], {});
      })
      .catch((error) => {
        this.toastr.warning(
          error,
          this.translate.instant("alerta.title.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
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
      permissions: controls.permissao.value,
      emergencyContacts: controls.contatosEmergencia.value,
    };

    return userFirebase;
  }

  voltar() {
    this.router.navigate(["../lista-de-usuario"], {});
  }

  async uploadPhoto() {
    if (this.imageFile) {
      try {
        let nomeFoto = this.fileAttr;

        const storageRef = this.angularFireStorage.ref(
          "user-images/" + nomeFoto
        );

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
      this.downloadURL = this.angularFireStorage
        .ref("/" + userData.photoURL)
        .getDownloadURL();

      console.log(this.downloadURL);
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
          // console.log(imgBase64Path);
          this.dataimage = imgBase64Path;
        };
      };
      reader.readAsDataURL(imgFile.target.files[0]);
    } else {
      this.fileAttr = "Choose File";
    }
  }

  confirmPassValidator(otherField: string) {
    // campo que será utilizado para validação (ex: 'confirmarEmail')
    const validator = (formControl: FormControl) => {
      if (otherField == null) {
        throw new Error("É necessário informar um campo.");
      }

      // validação para certificar primeiro a inicialização do formulário
      // Pois é possível que o FORMULARIO ou CAMPO ainda não estejam pronto para uso
      if (!formControl.root || !(<FormGroup>formControl.root).controls) {
        return null;
      }

      // campo a ser "comparado" (ex: 'email')
      const field = (<FormGroup>formControl.root).get(otherField);

      if (!field) {
        throw new Error("É necessário informar um campo válido.");
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
}
