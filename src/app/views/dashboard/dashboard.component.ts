import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UsuarioService } from '../pages/services/usuario.service';

export class Utils {
  public static unsubscribeAll(subObject: { subscriptions: Subscription[] }) {
    subObject.subscriptions.forEach((subscription) =>
      subscription.unsubscribe()
    );
  }
}

@Component({
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.scss"]
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  
  totalUsers: number = 0;
  totalBirthdays: number = 0;
  totalVehicles: number = 0;
  totalpedidosHistorico: number = 0;
  totalcatalogo: number = 0;
  totalClientes: number = 0;

  constructor(
    public router: Router,
    private usuarioService: UsuarioService,
  ) {}
  
  ngOnDestroy(): void {
    Utils.unsubscribeAll({ subscriptions: this.subscriptions });
  }

  ngOnInit(): void {
    const sub1 = this.usuarioService.count().subscribe((result) => {
      this.totalUsers = result.length;
    });

    this.subscriptions.push(sub1);
  }

  goToUsers() {
    this.router.navigate(["users"]);
  }
}
