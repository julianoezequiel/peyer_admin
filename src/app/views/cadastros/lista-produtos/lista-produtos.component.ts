import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort, MatSortable } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { Produto } from "../model/produto.model";
import { ProdutosService } from "../services/produtos.service";
import { Router, ActivatedRoute } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from "../../confirm-dialog/confirm-dialog.component";
import { ToastrService } from "ngx-toastr";

@Component({
  selector: "lista-produtos",
  templateUrl: "./lista-produtos.component.html",
  styleUrls: ["./lista-produtos.component.css"],
})
export class ListaProdutosComponent implements AfterViewInit, OnInit {
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: MatTableDataSource<Produto>;
  data :Produto[];

  order:boolean = false;

  constructor(
    public produtosService: ProdutosService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {}
  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ["descricao", "valorA", "unidade", "acoes"];

  async ngOnInit() {       
    await this.produtosService.listar().then((data)=>{
      this.data = data;      
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {        
    
  }

  sortDataSource(id: string, start: boolean){
    let ord = 'desc';
    if(this.order){
      ord = 'asc'
    }
    this.dataSource.sort.sort(<MatSortable>({id: id, start: ord}));
  }

  adicionar() {
    this.router.navigate(["../cadastro-produtos"], {
      relativeTo: this.activatedRoute,
    });
  }

  editar(id) {
    this.router.navigate(["../cadastro-produtos", id], {
      relativeTo: this.activatedRoute,
    });
  }

  confirmDialog(m): void {
    const message = `Deseja excluir o produto?`;

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

  excluir(m: Produto) {
    if (m._id) {
      this.produtosService.delete(m._id).then(() => {
        this.toastr.success("Produto excluído com sucesso", "Atenção!", {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
        this.produtosService.listar().then((data)=>{
          this.data = data;      
          this.dataSource = new MatTableDataSource(this.data);
          this.dataSource.sort = this.sort;
          this.dataSource.paginator = this.paginator;
        });
      });
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}
