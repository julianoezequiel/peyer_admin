import { AbsenceRequestsListComponent } from './views/pages/absence-requests/absence-requests-list/absence-requests-list.component';
import { ImprovementsRegistrationComponent } from "./views/pages/improvements/improvements-registration/improvements-registration.component";
import { ImprovementsListComponent } from "./views/pages/improvements/improvements-list/improvements-list.component";
import { NewslettersRegistrationComponent } from "./views/pages/newsletters/newsletters-registration/newsletters-registration.component";
import { NewslettersListComponent } from "./views/pages/newsletters/newsletters-list/newsletters-list.component";
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
import { DailyScheduleListComponent } from "./views/pages/daily-schedule/daily-schedule-list/daily-schedule-list.component";
import { DailyScheduleRegistrationComponent } from "./views/pages/daily-schedule/daily-schedule-registration/daily-schedule-registration.component";
import { AbsenceRequestsRegistrationComponent } from './views/pages/absence-requests/absence-requests-registration/absence-requests-registration.component';

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
          import("./views/pages/vehicle-history/vehicle-history.module").then(
            (m) => m.VehicleHistoryModule
          ),
        canActivate: [AuthGuard],
      },

      // NEWSLETTER
      {
        path: "newsletters",
        component: NewslettersListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "newsletters/news",
        component: NewslettersRegistrationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "newsletters/news/:id",
        component: NewslettersRegistrationComponent,
        canActivate: [AuthGuard],
      },

      // DAILY SCHEDULES
      {
        path: "daily-schedule",
        component: DailyScheduleListComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "daily-schedule/route-plan",
        component: DailyScheduleRegistrationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "daily-schedule/route-plan/:id",
        component: DailyScheduleRegistrationComponent,
        canActivate: [AuthGuard],
      },

      // IMPROVEMENTS
      {
        path: "improvements",
        component: ImprovementsListComponent,
        canActivate: [AuthGuard],
      },
      /*{
        path: "improvements/improvement",
        component: ImprovementsRegistrationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "improvements/improvement/:id",
        component: ImprovementsRegistrationComponent,
        canActivate: [AuthGuard],
      },*/

      // ABSENCE REQUESTS
      {
        path: "absence-requests",
        component: AbsenceRequestsListComponent,
        canActivate: [AuthGuard],
      },
      /*{
        path: "absence-requests/request",
        component: AbsenceRequestsRegistrationComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "absence-requests/request/:id",
        component: AbsenceRequestsRegistrationComponent,
        canActivate: [AuthGuard],
      },*/
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
