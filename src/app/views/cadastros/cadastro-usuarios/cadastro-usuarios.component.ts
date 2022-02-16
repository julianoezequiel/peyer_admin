import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ToastrService } from "ngx-toastr";
import { UsuarioService } from "../services/usuario.service";
import { AuthService } from "../../login/auth.service";
import { UserFirebase } from "../../login/userfirebase.model";
import { AuthData } from '../model/AuthData.model';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: "app-cadastro-usuarios",
  templateUrl: "./cadastro-usuarios.component.html",
  styleUrls: ["./cadastro-usuarios.component.css"],
})
export class CadastroUsuariosComponent implements OnInit {
  
  private subscriptions: Subscription[] = [];
  userForm: FormGroup;

  userData: UserFirebase = {
    uid: "",
    email: "",
    displayName: "",
    photoURL: "",
    emailVerified: true,
    password:'',
    password2:''
  };

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    public auth: AuthService
  ) {}

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
        this.userData.password2,[
        Validators.required,
        Validators.minLength(6),
      ]],
    });
  }

  onSubmit() {
    const controls = this.userForm.controls;
    /** check form */
    if (this.userForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    const userFirebase: UserFirebase = this.prepareUser();

    if (userFirebase.uid) {
      this.updateUser(userFirebase);
      return;
    }

    this.addUser(userFirebase);
  }

  addUser(userFirebase: UserFirebase) {    
    this.auth.SignUp(userFirebase).then((result)=>{
      userFirebase.uid = result.uid;
      this.toastr.success('Usuário cadastrado com sucesso, email de verificação enviado para ' + userFirebase.email,'Atenção!' ,{closeButton:true,progressAnimation:"decreasing",progressBar:true});      
      // this.updateUser(userFirebase);    
   }).catch((error)=>{
    this.toastr.warning(error,'Atenção!' ,{closeButton:true,progressAnimation:"decreasing",progressBar:true});      
   })
  }

  excluir(userFirebase:UserFirebase){
    this.usuarioService.delete(userFirebase.uid).then(()=>{
      this.toastr.success('Usuário excluído com sucesso','Atenção!' ,{closeButton:true,progressAnimation:"decreasing",progressBar:true});      
    }).catch((error)=>{
      this.toastr.warning(error,'Atenção!' ,{closeButton:true,progressAnimation:"decreasing",progressBar:true});      
    })
  }

  updateUser(userFirebase:UserFirebase) {   
    this.usuarioService.update(userFirebase.uid,userFirebase).then((result)=>{
      this.toastr.success('Usuário cadastrado com sucesso, email de verificação enviado para ' + userFirebase.email,'Atenção!' ,{closeButton:true,progressAnimation:"decreasing",progressBar:true});      
     }).catch((error)=>{
      this.toastr.warning(error,'Atenção!' ,{closeButton:true,progressAnimation:"decreasing",progressBar:true});      
     })
  }

  prepareUser(): UserFirebase {
    const controls = this.userForm.controls;
    const userFirebase : UserFirebase = {
      uid : this.userData.uid,
      displayName: controls.usuario.value,
      email:controls.email.value,
      photoURL:'',
      emailVerified:false,
      password:controls.senha.value,
      password2:controls.senha_confirma.value,
    }

    return userFirebase;
  }

  voltar(){
    this.router.navigate(["../lista-de-usuario"], {});
  }
}
