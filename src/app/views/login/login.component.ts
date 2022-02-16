import { Component, ChangeDetectorRef, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "./auth.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Subject, Observable } from "rxjs";

import { finalize, takeUntil, tap } from "rxjs/operators";
import { AuthNoticeService } from "./auth-notice/auth-notice.service";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-dashboard",
  templateUrl: "login.component.html",
})
export class LoginComponent implements OnInit, OnDestroy {
  // Public params
  loginForm: FormGroup;
  loading = false;
  isLoggedIn$: Observable<boolean>;
  errors: any = [];

  private unsubscribe: Subject<any>;

  private returnUrl: any;

  constructor(
    private router: Router,
    public auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
	private authNoticeService: AuthNoticeService,
	private toastr: ToastrService
  ) {
    this.unsubscribe = new Subject();
  }

  ngOnInit(): void {
    this.initLoginForm();

    // redirect back to the returnUrl before login
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params.returnUrl || "/";
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.loading = false;
  }

  initLoginForm() {
    this.loginForm = this.fb.group({
      email: ["",
        Validators.compose([
          Validators.required,
          // Validators.email,
          Validators.minLength(3),
          Validators.maxLength(320), // https://stackoverflow.com/questions/386294/what-is-the-maximum-length-of-a-valid-email-address
        ]),
      ],
      password: ["",
        Validators.compose([
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ]),
      ],
    });
  }

  submit() {
    const controls = this.loginForm.controls;
    /** check form */
    if (this.loginForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    this.loading = true;

    const authData = {
      email: controls.email.value,
      password: controls.password.value,
    };

    this.auth
      .SignIn(authData.email, authData.password)
      .then((result) => {
		// localStorage.setItem("user", JSON.stringify(result));
		this.router.navigate(["dashboard"]);
      })
      .catch(() => {
	  	this.toastr.warning('Usuário ou senha inválidos','Atenção!' ,{closeButton:true,progressAnimation:"decreasing",progressBar:true});      
      })
      .finally(() => {
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  isControlHasError(controlName: string, validationType: string): boolean {
    const control = this.loginForm.controls[controlName];
    if (!control) {
      return false;
    }

    const result =
      control.hasError(validationType) && (control.dirty || control.touched);
    return result;
  }

  esqueceuSenha(){

    const controls = this.loginForm.controls;

    let email = controls.email.value;
    if(!email){
      this.toastr.warning("Informe um email.",'Atenção!' ,{closeButton:true,progressAnimation:"decreasing",progressBar:true});   
      return; 
    }
    this.loading = true;
    this.auth.ForgotPassword(email).then((r)=>{
      this.toastr.success('Link de recuperação enviado para seu email.','Atenção!' ,{closeButton:true,progressAnimation:"decreasing",progressBar:true});      
    }).catch((e)=>{
      this.toastr.warning(e,'Atenção!' ,{closeButton:true,progressAnimation:"decreasing",progressBar:true});      
    }).finally(()=>{
      this.loading = false;
    })
  }
}
