import { EmergencyContacts } from './../model/emergencyContacts.model';
import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { UsuarioService } from "../services/usuario.service";
import { AuthService } from "../../login/auth.service";
import { UserFirebase } from "../../login/userfirebase.model";
import { AuthData } from "../model/AuthData.model";
import { Subscription } from "rxjs/internal/Subscription";
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { TranslateService } from "@ngx-translate/core";
import { AngularFireStorage } from "@angular/fire/storage";
import moment from "moment";
import { ContentObserver } from "@angular/cdk/observers";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";

@Component({
  selector: "app-cadastro-usuarios",
  templateUrl: "./cadastro-usuarios.component.html",
  styleUrls: ["./cadastro-usuarios.component.scss"],
})
export class CadastroUsuariosComponent implements OnInit {
  private subscriptions: Subscription[] = [];
  userForm: FormGroup;

  dataimage: any;
  contentType: any;
  imageFile: any;
  downloadURL: any;

  maxDate: Date = new Date();

  fileAttr = "Choose File";

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
    emergencyContacts: [{telefone: null, nome: ""}]
  };

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  dataSourceEC: MatTableDataSource<EmergencyContacts>;
  displayedColumns = ['nome','telefone','acoes'];

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    public auth: AuthService,
    public translate: TranslateService,
    private angularFireStorage: AngularFireStorage
  ) {}

  ngOnInit(): void {
    this.createForm();

    const routeSubscription = this.activatedRoute.params.subscribe((params) => {
      const id = params.id;
      if (id && id.length > 0) {
        const material = this.usuarioService.read(id).valueChanges();
        material.subscribe((value) => {

          this.userData = value;
          
          if (!this.userData.emergencyContacts) {
            this.userData.emergencyContacts = [];
          }
                   
          console.log("this.userData", this.userData);

          this.buildEmergencyContacts();

          this.userData.uid = id;
          this.createForm();
          this.downloadPhoto(this.userData);
        });
      }
    });
    this.subscriptions.push(routeSubscription);
  }

  buildEmergencyContacts() {
    this.dataSourceEC = new MatTableDataSource(this.userData.emergencyContacts);
    this.dataSourceEC.sort = this.sort;
    this.dataSourceEC.paginator = this.paginator;
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
      dataNascimento: [ new Date(this.userData.birthDate), [Validators.required]],
      permissao: this.fb.group({
        employee: this.userData.permissions.employee,
        administrative: this.userData.permissions.administrative,
        driver: this.userData.permissions.driver,
      }),
    });
  }

  async onSubmit() {
    const controls = this.userForm.controls;
    console.log(controls);

    /** check form */
    if (this.userForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    const userFirebase: UserFirebase = this.prepareUser();

    await this.uploadPhoto();

    if (userFirebase.uid) {
      this.updateUser(userFirebase);
    } else {
      this.addUser(userFirebase);
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
      emergencyContacts: this.userData.emergencyContacts
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
