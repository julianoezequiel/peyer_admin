import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortable } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ConfirmDialogComponent, ConfirmDialogModel } from '../../confirm-dialog/confirm-dialog.component';
import { Cliente } from '../model/cliente.model';
import { ClientesService } from '../services/clientes.service';

@Component({
  selector: 'app-lista-clientes',
  templateUrl: './lista-clientes.component.html',
  styleUrls: ['./lista-clientes.component.css']
})
export class ListaClientesComponent implements OnInit {

 
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort, { static: false }) sort: MatSort;

  dataSource: MatTableDataSource<Cliente>;
   
  data:Cliente[] ;
  loading = true;

  constructor(
    private clientesService: ClientesService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private toastr: ToastrService,
    public dialog: MatDialog,
  ) {}

  
  order:boolean = false;
  
  carregando = true;
  semconteudo = false;

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ["nome", "numero_celular","endereco","numero","acoes"];

  async ngOnInit() {  
     await  this.carregarDados();
  }

  ngAfterViewInit() {
   
  }

  async carregarDados() {
    this.carregando = true;
    await this.clientesService.listar().then((data) => {
      this.carregando = false;
      this.semconteudo = data.length <= 0;
      this.data = data;
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      // this.dataSource.sortingDataAccessor = (item, property) => {
      //   console.log(item)
      //   switch (property) {
      //     case 'data_entrega': {
      //       let d : firebase.firestore.Timestamp;
      //       d  = item.data as unknown as firebase.firestore.Timestamp;
      //       return new Date(d.toDate());
      //     }
      //     default: return item[property];
      //   }
      // };
      this.loading = false;
    });
  }

  

  sortDataSource(id: string){
    this.order = !this.order;
    let ord = 'desc';
    if(this.order){
      ord = 'asc'
    }
    this.dataSource.sort.sort(<MatSortable>({id: id, start: ord}));
  }

  adicionar() {
    this.router.navigate(["../cadastro-cliente", ""], {
      relativeTo: this.activatedRoute,
    });
  }

  editar(id) {
    this.router.navigate(["../cadastro-cliente", id], {
      relativeTo: this.activatedRoute,
    });
  }

  confirmDialog(m): void {
    const message = `Deseja excluir o cliente?`;

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

  excluir(m: Cliente) {
    this.loading = true;
    if (m._id) {
      this.clientesService.delete(m._id).then(() => {
        this.toastr.success("Cliente excluído com sucesso", "Atenção!", {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
        this.clientesService.listar().then((data) => {
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

}
