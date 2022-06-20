import { DriversHistoryComponent } from './drivers-history/drivers-history.component';
import { VehicleHistoryComponent } from "./vehicle-history.component";
import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { AuthGuard } from "../../auth/auth.guard";
import { RoutesHistoryComponent } from './routes-history/routes-history.component';
import { DamagesHistoryComponent } from './damages-history/damages-history.component';

const routes: Routes = [
  {
    path: "",
    component: VehicleHistoryComponent,
    data: {
      title: "cadastros.vehicleHistory.title.history",
    },
    children: [
      {
        path: "",
        redirectTo: "drivers-history",
        pathMatch: "full",
      },
      {
        path: "drivers-history",
        component: DriversHistoryComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "routes-history",
        component: RoutesHistoryComponent,
        canActivate: [AuthGuard],
      },
      {
        path: "damages-history",
        component: DamagesHistoryComponent,
        canActivate: [AuthGuard],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VehicleHistoriesRoutingModule {}
