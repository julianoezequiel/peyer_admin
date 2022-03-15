import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { UsuarioService } from "../services/usuario.service";
import { AuthService } from "../../login/auth.service";
import { UserFirebase } from "../../login/userfirebase.model";
import { AuthData } from '../model/AuthData.model';
import { Subscription } from 'rxjs/internal/Subscription';
import { AngularFirestoreModule } from "@angular/fire/firestore";
import { TranslateService } from "@ngx-translate/core";
import { AngularFireStorage } from '@angular/fire/storage';


@Component({
  selector: "app-cadastro-usuarios",
  templateUrl: "./cadastro-usuarios.component.html",
  styleUrls: ["./cadastro-usuarios.component.css"],
})
export class CadastroUsuariosComponent implements OnInit {

  private subscriptions: Subscription[] = [];
  userForm: FormGroup;

  dataimage: any;
  contentType: any;
  imageFile: any;
  downloadURL:any;

  // @ViewChild('fileInput') fileInput: ElementRef;
  fileAttr = 'Choose File';

  userData: UserFirebase = {
    uid: "",
    email: "",
    displayName: "",
    photoURL: "",
    emailVerified: true,
    password: '',
    password2: ''
  };

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
  ) { }

  ngOnInit(): void {
    this.createForm();
    const routeSubscription = this.activatedRoute.params.subscribe(
      (params) => {
        const id = params.id;
        if (id && id.length > 0) {
          const material = this.usuarioService
            .read(id)
            .valueChanges();
          material.subscribe((value) => {
            this.userData = value;
            this.userData.uid = id;
            this.createForm();
            this.downloadPhoto(this.userData);
          });
        }
      }
    );
    this.subscriptions.push(routeSubscription);
  }

  createForm() {
    this.userForm = this.fb.group({
      usuario: [this.userData.displayName, Validators.required],
      email: [this.userData.email, [Validators.required, Validators.email]],
      senha: [this.userData.password, [Validators.required, Validators.minLength(6)]],
      senha_confirma: [
        this.userData.password2, [
          Validators.required,
          Validators.minLength(6),
        ]],
    });
  }

  async onSubmit() {
    const controls = this.userForm.controls;
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
    this.auth.SignUp(userFirebase).then((result) => {
      userFirebase.uid = result.uid;
      this.toastr.success(this.translate.instant('cadastros.usuarios.msg.sucesso', { 'value': userFirebase.email }), this.translate.instant('alerta.title.atencao'), { closeButton: true, progressAnimation: "decreasing", progressBar: true });
      // this.updateUser(userFirebase);    
    }).catch((error) => {
      this.toastr.warning(error, this.translate.instant('alerta.title.atencao'), { closeButton: true, progressAnimation: "decreasing", progressBar: true });
    })
  }

  excluir(userFirebase: UserFirebase) {
    this.usuarioService.delete(userFirebase.uid).then(() => {
      this.toastr.success(this.translate.instant('cadastros.usuarios.msg.exclusao'), this.translate.instant('alerta.title.atencao'), { closeButton: true, progressAnimation: "decreasing", progressBar: true });
    }).catch((error) => {
      this.toastr.warning(error, this.translate.instant('alerta.title.atencao'), { closeButton: true, progressAnimation: "decreasing", progressBar: true });
    })
  }

  updateUser(userFirebase: UserFirebase) {
    this.usuarioService.update(userFirebase.uid, userFirebase).then((result) => {
      this.toastr.success(this.translate.instant('cadastros.usuarios.msg.sucesso', { 'value': userFirebase.email }), this.translate.instant('alerta.title.atencao'), { closeButton: true, progressAnimation: "decreasing", progressBar: true });
    }).catch((error) => {
      this.toastr.warning(error, this.translate.instant('alerta.title.atencao'), { closeButton: true, progressAnimation: "decreasing", progressBar: true });
    })
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
      password2: controls.senha_confirma.value,
    }

    return userFirebase;
  }

  voltar() {
    this.router.navigate(["../lista-de-usuario"], {});
  }

  async uploadPhoto() {
    if (this.imageFile) {
      try {

        let nomeFoto = this.fileAttr;

        const storageRef = this.angularFireStorage.ref('user-images/' + nomeFoto);

        const task = storageRef.put(this.imageFile);

        const urlPhoto = (await task.task).ref.fullPath;
     
        this.userData.photoURL = urlPhoto;

      } catch (error) {
        console.error(error);
      }
    }
  }

   downloadPhoto(userData: UserFirebase){
   
    this.downloadURL = this.angularFireStorage.ref('/'+ userData.photoURL).getDownloadURL();
    
    console.log(this.downloadURL);  

  }

  uploadFileEvt(imgFile: any) {
    if (imgFile.target.files && imgFile.target.files[0]) {
      this.fileAttr = '';
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
        image.onload = rs => {
          let imgBase64Path = e.target.result;
          // console.log(imgBase64Path);
          this.dataimage = imgBase64Path;
        };
      };
      reader.readAsDataURL(imgFile.target.files[0]);
    } else {
      this.fileAttr = 'Choose File';
    }
  }
}
