import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { rowsAnimation } from "../../../../shared/animations";

import { DriversRouteHistory } from "../../model/vehicle-history/drivers-history.model";
import { VehicleHistoryService } from "../../services/vehicle-history.service";

@Component({
  selector: "app-routes-history",
  templateUrl: "./routes-history.component.html",
  styleUrls: ["./routes-history.component.scss"],
  animations: [rowsAnimation]
})
export class RoutesHistoryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  dataList: DriversRouteHistory[] = [];
  dataEmpty = true;
  loading = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private vehicleHistoryService: VehicleHistoryService
  ) {}

  ngOnInit(): void {
    const subActivatedRoute = this.activatedRoute.parent.params.subscribe(
      (v) => {
        this.vehicleHistoryService.getHistoryDriversRoute(v.id).then((data) => {
          this.dataList = data;

          this.dataEmpty = this.dataList.length == 0;
          this.loading = false;
        });
      }
    );

    this.subscriptions.push(subActivatedRoute);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
