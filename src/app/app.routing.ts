import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { DefaultLayoutComponent } from "./containers";
import { PaginaSucessoComponent } from "./views/cadastros/pagina-sucesso/pagina-sucesso.component";
import { CadastroUsuariosComponent } from "./views/cadastros/usuarios/cadastro-usuarios/cadastro-usuarios.component";
import { ListaUsuariosComponent } from "./views/cadastros/usuarios/lista-usuarios/lista-usuarios.component";
import { P404Component } from "./views/error/404.component";
import { P500Component } from "./views/error/500.component";
import { AuthGuard } from "./views/guard/auth.guard";
import { LoginComponent } from "./views/login/login.component";

// Import Containers
export const routes: Routes = [
  {
    path: "",
    redirectTo: "dashboard",
    pathMatch: "full",
    canActivate: [AuthGuard],
  },
  {
    path: "",
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],

    children: [
      //Dashboard
      {
        path: "dashboard",
        loadChildren: () =>
          import("./views/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          ),
      },

      // USERS
      {
        path: "users",
        component: ListaUsuariosComponent,
      },
      {
        path: "users/user",
        component: CadastroUsuariosComponent,
      },
      {
        path: "users/user/:id",
        component: CadastroUsuariosComponent,
      },

      {
        path: "base",
        loadChildren: () =>
          import("./views/base/base.module").then((m) => m.BaseModule),
      },
      {
        path: "theme",
        loadChildren: () =>
          import("./views/theme/theme.module").then((m) => m.ThemeModule),
      },
      {
        path: "widgets",
        loadChildren: () =>
          import("./views/widgets/widgets.module").then((m) => m.WidgetsModule),
      },
    ],
  },
  {
    path: "sucess",
    component: PaginaSucessoComponent,
    data: {
      title: "Sucesso",
    },
  },
  {
    path: "404",
    component: P404Component,
    data: {
      title: "Page 404",
    },
  },
  {
    path: "500",
    component: P500Component,
    data: {
      title: "Page 500",
    },
  },
  {
    path: "login",
    component: LoginComponent,
    data: {
      title: "Login Page",
    },
  },
  { path: "**", component: P404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
