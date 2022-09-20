import { rowsAnimation } from './../../../../shared/animations';
import { DriversRouteHistory } from './../../model/vehicle-history/drivers-history.model';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';

import { VehicleHistoryService } from './../../services/vehicle-history.service';
import moment from 'moment';

@Component({
  selector: "app-drivers-history",
  templateUrl: "./drivers-history.component.html",
  styleUrls: ["./drivers-history.component.scss"],
  animations: [rowsAnimation],
})
export class DriversHistoryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  dataList: DriversRouteHistory[] = [];
  dataEmpty = true;
  loading = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private vehicleHistoryService: VehicleHistoryService
  ) {}

  ngOnInit(): void {
    const subActivatedRoute = this.activatedRoute.parent.params.subscribe((v) => {
      this.vehicleHistoryService
        .getHistoryDriversRoute(v.id)
        .then(data => {

          this.dataList = data;

          this.dataEmpty = this.dataList.length == 0;
          this.loading = false;
        });
    });

    this.subscriptions.push(subActivatedRoute);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
