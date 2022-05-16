import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { UsuarioService } from '../cadastros/services/usuario.service';

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
  totalpedidos: number = 0;
  totalusuarios: number = 0;
  totalprodutos: number = 0;
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
      this.totalusuarios = result.length;
    });

    this.subscriptions.push(sub1);
  }

  goToUsusarios() {
    this.router.navigate(["users"]);
  }
}
