import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs/internal/Subscription';

import { VehicleService } from './../services/vehicle.service';

@Component({
  selector: "app-vehicle-history",
  templateUrl: "./vehicle-history.component.html",
  styleUrls: ["./vehicle-history.component.scss"],
})
export class VehicleHistoryComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  navLinks = [
    {
      label: "cadastros.vehicleHistory.title.driversHistory",
      path: "../histories/drivers-history",
      icon: "badge",
    },
    {
      label: "cadastros.vehicleHistory.title.routesHistory",
      path: "../histories/routes-history",
      icon: "route",
    },
    {
      label: "cadastros.vehicleHistory.title.damagesHistory",
      path: "../histories/damages-history",
      icon: "warning",
    },
  ];

  pageTitle: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    const subActivatedRoute = this.activatedRoute.params.subscribe((x) => {

      const subData = this.vehicleService.getById(x.id).get().subscribe(o => {

        let historyOf = this.translate.instant("cadastros.vehicleHistory.title.history");
        let vehicleName = o.data().name;

        this.pageTitle = historyOf + vehicleName;
      });

      this.subscriptions.push(subData);
    });

    this.subscriptions.push(subActivatedRoute);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }

}
