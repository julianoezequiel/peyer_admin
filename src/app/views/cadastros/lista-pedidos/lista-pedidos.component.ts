import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Router, ActivatedRoute } from "@angular/router";
import { PedidosService } from "../services/pedidos.service";
import { Pedido } from "../model/pedido.model";
import { ToastrService } from "ngx-toastr";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogModel,
  ConfirmDialogComponent,
} from "../../confirm-dialog/confirm-dialog.component";
import { Timestamp } from "rxjs/internal/operators/timestamp";
import { CurrencyPipe } from "@angular/common";

@Component({
  selector: "lista-pedidos",
  templateUrl: "./lista-pedidos.component.html",
  styleUrls: ["./lista-pedidos.component.css"],
})
export class ListaPedidosComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  dataSource: MatTableDataSource<Pedido>;

  data: Pedido[];
  loading = true;

  constructor(
    private pedidosService: PedidosService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public dialog: MatDialog,
    private currencyPipe:CurrencyPipe
  ) {}

  order: boolean = false;

  carregando = true;
  semconteudo = false;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = [
    "cliente.nome",
    "cliente.numero_celular",
    "data_entrega",
    "acoes",
  ];

  async ngOnInit() {
    await this.carregarDados();
  }

  ngAfterViewInit() {}

  async carregarDados() {
    this.carregando = true;
    await this.pedidosService.listar().then((data) => {
      this.carregando = false;
      this.semconteudo = data.length <= 0;
      this.data = data;
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      this.dataSource.sortingDataAccessor = (item, property) => {
        console.log(item);
        switch (property) {
          case "data_entrega": {
            let d: firebase.firestore.Timestamp;
            d = item.data as unknown as firebase.firestore.Timestamp;
            return new Date(d.toDate());
          }
          default:
            return item[property];
        }
      };
      this.loading = false;
    });
  }

  sortDataSource(id: string) {
    this.order = !this.order;
    let ord = "desc";
    if (this.order) {
      ord = "asc";
    }
    this.dataSource.sort.sort(<MatSortable>{ id: id, start: ord });
  }

  adicionar() {
    this.router.navigate(["../cadastro-pedidos", ""], {
      relativeTo: this.activatedRoute,
    });
  }

  editar(id) {
    this.router.navigate(["../cadastro-pedidos", id], {
      relativeTo: this.activatedRoute,
    });
  }

  confirmDialog(m): void {
    const message = `Deseja excluir o pedido?`;

    const dialogData = new ConfirmDialogModel("Confirmar", message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult == true) {
        this.excluir(m);
      }
    });
  }

  excluir(m: Pedido) {
    this.loading = true;
    if (m._id) {
      this.pedidosService.delete(m._id).then(() => {
        this.toastr.success("Pedido excluído com sucesso", "Atenção!", {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
        this.pedidosService.listar().then((data) => {
          this.data = data;
          this.dataSource = new MatTableDataSource(this.data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
          this.loading = false;
        });
      });
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }

  gerarRelatorio() {
    // let listaProd: Pedido[] = [];

    let relatorio: string = "Lista de Pedidos Pendentes " + "\n\r";

    this.dataSource.filteredData.forEach((p) => {
      relatorio += "----------------------------------------------------------------------------------------------------\n"
      relatorio += "Nome: " + p.cliente.nome + "\n";
      relatorio +=
        "Endereço: " + p.cliente.endereco + (p.cliente.numero? " - Nº: " + p.cliente.numero :'');
      relatorio +=  p.cliente.complemento? " Complemento: " + p.cliente.complemento:"";
      relatorio += " Cel: " + p.cliente.numero_celular + "\n";
      relatorio += "----------------------------------------------------------------------------------------------------\n"
      let detPedido: string = "";
      p.produto_pedido.forEach((pd) => {
        detPedido +=
          pd.quantidade +
          " " +
          new String(pd.descricao) +
          " " +
          this.currencyPipe.transform(pd.valor_total, "BRL") +
          "\n";
      });
      relatorio += detPedido + "\n";
      relatorio += "Total : " + this.currencyPipe.transform(p.total_pedido,'BRL') ;
      
      relatorio += "\n";
    });
    var textFileAsBlob = new Blob([relatorio], { type: "text/plain" });

    var fileNameToSaveAs = "Total pedido";
    var downloadLink = document.createElement("a");
    downloadLink.download = fileNameToSaveAs;
    downloadLink.innerHTML = "Download File";
    if (window.webkitURL != null) {
      // Chrome allows the link to be clicked
      // without actually adding it to the DOM.
      downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    } else {
      // Firefox requires the link to be added to the DOM
      // before it can be clicked.
      downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
      // downloadLink.onclick = destroyClickedElement;
      downloadLink.style.display = "none";
      document.body.appendChild(downloadLink);
    }

    downloadLink.click();
    // this.pedidosService.buscarPorId(this.pedido._id).then((p) => {

    //   let  relatorio : string = "Nome: " + p.cliente.nome + "\n";

    //   relatorio += "Endereço: " + p.cliente.endereco + " - Nº: " + p.cliente.numero + "\n";
    //   relatorio += "Complemento: " + p.cliente.complemento;
    //   relatorio += "Cel: " + p.cliente.numero_celular + "\n\r";

    //   let detPedido :string='';
    //   p.produto_pedido.forEach((pd)=>{
    //     detPedido += pd.quantidade + ' ' + new String(pd.descricao) + ' ' + this.currencyPipe.transform(pd.valor_total,'BRL') + "\n";
    //   });

    //   relatorio += detPedido + '\n';
    //   relatorio += "Total : " + this.currencyPipe.transform(p.total_pedido,'BRL')
    //   relatorio += "\n\r";

    //   var textFileAsBlob = new Blob([relatorio], { type: "text/plain" });

    //   var fileNameToSaveAs = "Total pedido";
    //   var downloadLink = document.createElement("a");
    //   downloadLink.download = fileNameToSaveAs;
    //   downloadLink.innerHTML = "Download File";
    //   if (window.webkitURL != null) {
    //     // Chrome allows the link to be clicked
    //     // without actually adding it to the DOM.
    //     downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
    //   } else {
    //     // Firefox requires the link to be added to the DOM
    //     // before it can be clicked.
    //     downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
    //     // downloadLink.onclick = destroyClickedElement;
    //     downloadLink.style.display = "none";
    //     document.body.appendChild(downloadLink);
    //   }

    //   downloadLink.click();
    // });
  }

  groupBy(objectArray, property) {
    return objectArray.reduce(function (acc, obj) {
      var key = obj[property];
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(obj);
      return acc;
    }, {});
  }
}
