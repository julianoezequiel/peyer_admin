import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

import { UsuarioService } from './views/cadastros/services/usuario.service';
import { AuthService } from './views/login/auth.service';

@Component({
  selector: "body",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent implements OnInit {
  checkingUser = true;

  constructor(
    private router: Router,
    private translate: TranslateService,
    public usuarioService: UsuarioService,
    public authService: AuthService,
    private toastr: ToastrService
  ) {
    translate.setDefaultLang("en");
  }

  async ngOnInit() {


    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });

    setTimeout(() => {
      this.checkingUser = false;
    }, 2000);
  }
}
