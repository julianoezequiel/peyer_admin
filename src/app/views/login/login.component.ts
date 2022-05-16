import { ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { Observable, Subject } from "rxjs";

import { UsuarioService } from "../cadastros/services/usuario.service";
import { AuthService } from "./auth.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "login.component.html",
  styleUrls: ["login.component.scss"],
})
export class LoginComponent implements OnInit, OnDestroy {
  // Public params
  loginForm: FormGroup;
  loading = false;
  isLoggedIn$: Observable<boolean>;
  errors: any = [];

  private unsubscribe: Subject<any>;

  private returnUrl: any;

  hideSenha: boolean;

  constructor(
    private router: Router,
    public auth: AuthService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private usuarioService: UsuarioService,
    private toastr: ToastrService,
    public translate: TranslateService
  ) {
    this.unsubscribe = new Subject();
  }

  ngOnInit(): void {
    this.initLoginForm();

    // redirect back to the returnUrl before login
    this.route.queryParams.subscribe((params) => {
      this.returnUrl = params.returnUrl || "/";
    });

    this.hideSenha = true;
  }

  ngOnDestroy(): void {
    this.unsubscribe.next();
    this.unsubscribe.complete();
    this.loading = false;
  }

  initLoginForm() {
    this.loginForm = this.fb.group({
      email: ["", Validators.compose([Validators.required, Validators.email])],
      password: [
        "",
        Validators.compose([Validators.required, Validators.minLength(6)]),
      ],
    });
  }

  async onSubmit() {
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
      .then((result: any) => {
        this.checkPermission(result.user.uid);
      })
      .catch((error) => {
        this.toastr.warning(
          error,
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
      })
      .finally(async () => {
        this.loading = false;
        this.cdr.markForCheck();
      });
  }

  checkPermission(userId: number) {
    let userSub = this.usuarioService.read(userId).get();

    userSub.subscribe((x) => {
      let userAuth = x.data();

      if (!userAuth.permissions.administrative) {
        this.toastr.warning(
          this.translate.instant("login.semPermissao"),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        this.loading = false;
        this.cdr.markForCheck();

        return;
      } else {
        this.router.navigate(["dashboard"]);
      }
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

  esqueceuSenha() {
    const controls = this.loginForm.controls;

    let email = controls.email.value;
    if (!email) {
      this.toastr.warning(
        this.translate.instant("login.informarEmail"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    }
    this.loading = true;
    this.auth
      .ForgotPassword(email)
      .then((r) => {
        this.toastr.success(
          this.translate.instant("login.enviadoLinkRecuperacao"),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
      })
      .catch((error) => {
        this.toastr.warning(error, this.translate.instant("alerta.atencao"), {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
      })
      .finally(() => {
        this.loading = false;
      });
  }

  changeCampoSenha($event) {
    this.hideSenha = !this.hideSenha;
  }
}
