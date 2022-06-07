import { AlertDialogComponent } from './../../../shared/alert-dialog/alert-dialog.component';
import { UsuarioService } from './../../cadastros/services/usuario.service';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';


import { AuthService } from '../services/auth.service';

@Component({
  selector: "app-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  fpForm: FormGroup;

  oobCode: string;
  oobCodeChecked: boolean;

  emailUser: string;

  hideSenha = true;
  hideConfirmaSenha = true;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private usuarioService: UsuarioService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private fb: FormBuilder
  ) {
    const routeSubscription = this.activatedRoute.queryParams.subscribe(
      (params) => (this.oobCode = params["oobCode"])
    );

    this.subscriptions.push(routeSubscription);
  }

  async ngOnInit() {
    if (this.oobCode) {
      this.authService
        .verifyPasswordResetCode(this.oobCode)
        .then((email: string) => {
          this.emailUser = email;
          this.oobCodeChecked = true;
          this.initForm();
        })
        .catch((error) => {
          console.log(error);
          this.alertDialog(error);
        });
    } else {
      this.router.navigate(["/login"]);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }

  initForm() {
    this.fpForm = this.fb.group({
      newPassword: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: [
        "",
        [
          Validators.required,
          Validators.minLength(6),
          this.confirmPassValidator("newPassword"),
        ],
      ],
    });
  }

  onSubmit() {
    const controls = this.fpForm.controls;

    controls["newPassword"].updateValueAndValidity();
    controls["confirmPassword"].updateValueAndValidity();

    /* check form */
    if (this.fpForm.invalid) {
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
      });
      return;
    }

    let newPassword = controls["newPassword"].value;

    this.authService
      .confirmPasswordReset(this.oobCode, newPassword)
      .then(() => {
        this.usuarioService
          .updatePasswordFirestore(this.emailUser, newPassword)
          .then(() => {
            this.alertDialog(this.translate.instant("mensagem.sucesso.alterado"));
          })
          .catch((error) => {
            console.log(error);
            this.alertDialog(error);
          });
      })
      .catch((error) => {
        console.log(error);
        this.alertDialog(error);
      });
  }

  alertDialog(msg): void {
    const dialogRef = this.dialog.open(AlertDialogComponent, {
      maxWidth: "400px",
      data: { message: msg },
    });

    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(["/login"]);
    });
  }

  changeCampoSenha() {
    this.hideSenha = !this.hideSenha;
  }

  changeCampoConfirmaSenha() {
    this.hideConfirmaSenha = !this.hideConfirmaSenha;
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
}
