import { rowsAnimation } from './../../../../shared/animations';
import { DriversHistory } from './../../model/vehicle-history/drivers-history.model';
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

  dataList: DriversHistory[] = [];
  dataEmpty = true;
  loading = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private vehicleHistoryService: VehicleHistoryService
  ) {}

  ngOnInit(): void {
    const subActivatedRoute = this.activatedRoute.parent.params.subscribe((x) => {
      const subHistory = this.vehicleHistoryService
        .getHistoryDrivers(x.id)
        .valueChanges()
        .subscribe(data => {

       data.sort((v1, v2) => {

          let d1 = moment(v1.updateDate, ["DD/MM/YYYY HH:mm"]);
          let d2 = moment(v2.updateDate, ["DD/MM/YYYY HH:mm"]);
        
          return moment(d2).diff(d1);
        });

        this.dataList = data as DriversHistory[];

        this.dataEmpty = this.dataList.length == 0;
        this.loading = false;
        });

      this.subscriptions.push(subHistory);
    });

    this.subscriptions.push(subActivatedRoute);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }
}
