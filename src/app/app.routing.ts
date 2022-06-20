import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { DefaultLayoutComponent } from "./containers";
import { AuthGuard } from "./views/auth/auth.guard";
import { ForgotPasswordComponent } from "./views/auth/forgot-password/forgot-password.component";
import { LoginComponent } from "./views/auth/login/login.component";
import { P404Component } from "./views/error/404.component";
import { P500Component } from "./views/error/500.component";
import { UsersRegistrationComponent } from "./views/pages/users/users-registration/users-registration.component";
import { UsersListComponent } from "./views/pages/users/users-list/users-list.component";
import { VehiclesListComponent } from "./views/pages/vehicles/vehicles-list/vehicles-list.component";
import { VehiclesRegistrationComponent } from "./views/pages/vehicles/vehicles-registration/vehicles-registration.component";

// Import Containers
export const routes: Routes = [
  {
    path: "",
    redirectTo: "login",
    pathMatch: "full",
    canActivate: [AuthGuard],
  },
  {
    path: "",
    component: DefaultLayoutComponent,
    canActivate: [AuthGuard],

    children: [
      // DASHBOARD
      {
        path: "dashboard",
        loadChildren: () =>
          import("./views/dashboard/dashboard.module").then(
            (m) => m.DashboardModule
          ),
        canActivate: [AuthGuard],
      },

      // USERS
      {
        path: "users",
        component: UsersListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "users/user",
        component: UsersRegistrationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "users/user/:id",
        component: UsersRegistrationComponent,
        canActivate: [AuthGuard],
      },

      // VEHICLES
      {
        path: "vehicles",
        component: VehiclesListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "vehicles/vehicle",
        component: VehiclesRegistrationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "vehicles/vehicle/:id",
        component: VehiclesRegistrationComponent,
        canActivate: [AuthGuard],
      },

      // VEHICLES HISTORIES
      {
        path: "vehicles/vehicle/:id/histories",
        loadChildren: () =>
          import(
            "./views/pages/vehicle-histories/vehicle-history.module"
          ).then((m) => m.VehicleHistoriesModule),
        canActivate: [AuthGuard],
      },
    ],
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
  },
  {
    path: "forgot-password",
    component: ForgotPasswordComponent,
  },
  { path: "**", component: P404Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
