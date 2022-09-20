import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
} from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

import { UserFirebase } from "../pages/model/user/userfirebase.model";
import { UsuarioService } from "../pages/services/usuario.service";
import { AuthService } from "./services/auth.service";

// Angular
// RxJS
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private translate: TranslateService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot, tentativas?: number, user?: any): Promise<boolean> | boolean {
    let userLocal: UserFirebase = user ? user : JSON.parse(localStorage.getItem("user_firebase")) as UserFirebase;

    if (userLocal) {
      return this.usuarioService
        .getById(userLocal.uid).get().toPromise()
        .then(async (u) => {
          if (u.exists) {
            let userData = u.data() as UserFirebase;
            let userCurrent = await await this.afAuth.currentUser;

            tentativas = tentativas ? tentativas : 0;

            if (userCurrent) {

              if (
                userData.email == userCurrent.email &&
                userCurrent.email == userLocal.email
              ) {
                if (!userData.permissions.administrative) {
                  this.signOut(true);
                  return false;
                } else {
                  return true;
                }
              } else {
                this.signOut(false);
                return false;
              }
            } else {
              if (tentativas > 40 && tentativas < 60) {
                this.authService
                  .SignIn(userData.email, userData.password)
                  .catch(() => {
                    this.signOut(false);
                    return false;
                  });
              }

              tentativas++;

              return this.canActivate(route, state, tentativas, userLocal);
            }
          } else {
            this.signOut(false);
            return false;
          }
        });
    } else {
      this.signOut(false);
      return false;
    }
  }

  private signOut(semPermissao: boolean) {
    let msg = semPermissao ? "login.semPermissao" : "login.refazer";

    this.toastr.warning(
      this.translate.instant(msg),
      this.translate.instant("alerta.atencao"),
      {
        closeButton: true,
        progressAnimation: "decreasing",
        progressBar: true,
      }
    );
    this.authService.SignOut().then();
  }
}
