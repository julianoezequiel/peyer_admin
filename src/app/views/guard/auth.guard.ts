import { AngularFireAuth } from '@angular/fire/auth';
import { UserFirebase } from "./../cadastros/model/userfirebase.model";
import { Injectable } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivate,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";
import { Observable } from "rxjs";

import { UsuarioService } from "./../cadastros/services/usuario.service";
import { AuthService } from "./../login/auth.service";

// Angular
// RxJS
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private translate: TranslateService,
    private usuarioService: UsuarioService,
    private authService: AuthService,
    private afAuth: AngularFireAuth,
    private toastr: ToastrService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | boolean {

    let userLocal = JSON.parse(localStorage.getItem("user_firebase")) as UserFirebase;

    if (userLocal) {
      return this.usuarioService.read(userLocal.uid).get().toPromise()
        .then(async (u) => {
          if (u.exists) {

            let userData = u.data() as UserFirebase;
            let userCurrent = await (await this.afAuth.currentUser);

            if(userCurrent) {
              //console.log("Current", userCurrent);
            
              if (userData.email == userCurrent.email && userCurrent.email == userLocal.email) {
                if (!userData.permissions.administrative) {
                  this.signOut(true);
                } else {
                  return true;
                }
              } else {
                this.signOut(false);
                return false;
              }
            } else {
              this.authService.SignIn(userData.email, userData.password)
              .catch(() => {
                this.signOut(false);
                return false;
              });
              return this.canActivate(route, state);
            }


          } else {
            this.signOut(false);
            return false;
          }
          
        });
    } else {
        this.signOut(false);
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
