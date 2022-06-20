import { rowsAnimation } from './../../../shared/animations';
import { Subscription } from "rxjs/internal/Subscription";
import { TranslateService } from "@ngx-translate/core";
import { Router, RouterLinkActive } from "@angular/router";
import { ActivatedRoute } from "@angular/router";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from "@angular/core";
import { ThemePalette } from "@angular/material/core";

@Component({
  selector: "app-vehicle-history",
  templateUrl: "./vehicle-history.component.html",
  styleUrls: ["./vehicle-history.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush,
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
      icon: "map",
    },
    {
      label: "cadastros.vehicleHistory.title.damagesHistory",
      path: "../histories/damages-history",
      icon: "nearby_error",
    },
  ];

  pageTitle: string;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private translateService: TranslateService,
    private changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const subActivatedRoute = this.activatedRoute.data.subscribe((x) => {
      this.pageTitle = x.title;
    });

    this.subscriptions.push(subActivatedRoute);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }

}
