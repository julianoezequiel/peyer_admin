import { Component, OnInit, OnDestroy } from "@angular/core";
import { getStyle, hexToRgba } from "@coreui/coreui/dist/js/coreui-utilities";
import { CustomTooltips } from "@coreui/coreui-plugin-chartjs-custom-tooltips";
import { Router } from "@angular/router";
import { PedidosService } from "../cadastros/services/pedidos.service";
import { Subscription } from "rxjs";
import { UsuarioService } from "../cadastros/services/usuario.service";
import { ProdutosService } from "../cadastros/services/produtos.service";
import { PedidosHistoricoService } from "../cadastros/services/pedidos-historico.service";
import { CatalogoService } from '../cadastros/services/catalogo.service';
import { ClientesService } from '../cadastros/services/clientes.service';

export class Utils {
  public static unsubscribeAll(subObject: { subscriptions: Subscription[] }) {
    subObject.subscriptions.forEach((subscription) =>
      subscription.unsubscribe()
    );
  }
}

@Component({
  templateUrl: "dashboard.component.html",
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  totalpedidos: number = 0;
  totalusuarios: number = 0;
  totalprodutos: number = 0;
  totalpedidosHistorico: number = 0;
  totalcatalogo: number = 0;
  totalClientes:number = 0;

  constructor(
    public router: Router,
    private pedidosService: PedidosService,
    private usuarioService: UsuarioService,
    private produtosService: ProdutosService,
    private pedidosHistoricoService: PedidosHistoricoService,
    private catalogoService: CatalogoService,
    private clientesService:ClientesService
  ) {}
  ngOnDestroy(): void {
    Utils.unsubscribeAll({ subscriptions: this.subscriptions });
  }

  ngOnInit(): void {
    const sub = this.pedidosService.count().subscribe((result) => {
      this.totalpedidos = result.length;
    });
    const sub2 = this.usuarioService.count().subscribe((result) => {
      this.totalusuarios = result.length;
    });
    const sub3 = this.produtosService.count().subscribe((result) => {
      this.totalprodutos = result.length;
    });
    const sub4 = this.pedidosHistoricoService.count().subscribe((result) => {
      this.totalpedidosHistorico = result.length;
    });
    const sub5 = this.catalogoService.count().subscribe((result) => {
      this.totalcatalogo = result.length;
    });
    const sub6 = this.clientesService.count().subscribe((result) => {
      this.totalClientes = result.length;
    });

    this.subscriptions.push(sub);
    this.subscriptions.push(sub2);
    this.subscriptions.push(sub3);
    this.subscriptions.push(sub4);
    this.subscriptions.push(sub5);
    this.subscriptions.push(sub6);
  }

  goToPedidos() {
    this.router.navigate(["lista-de-pedidos"]);
  }

  goToProdutos() {
    this.router.navigate(["lista-de-produtos"]);
  }

  goTocatalogos() {
    this.router.navigate(["lista-de-catalogo"]);
  }

  goToUsusarios() {
    this.router.navigate(["lista-de-usuario"]);
  }

  goTohistorico() {
    this.router.navigate(["lista-de-historico"]);
  }

  goToPedido() {
    this.router.navigate(["pedido"]);
  }

  goToClientes() {
    this.router.navigate(["lista-de-clientes"]);
  }
}
