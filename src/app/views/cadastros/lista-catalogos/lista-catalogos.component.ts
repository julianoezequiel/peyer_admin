import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ListaCatalogoDataSource } from './lista-catalogos-datasource';
import { Catalogo } from '../model/catalogo.model';
import { ProdutosService } from '../services/produtos.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CatalogoService } from '../services/catalogo.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-lista-catalogos',
  templateUrl: './lista-catalogos.component.html',
  styleUrls: ['./lista-catalogos.component.css']
})
export class ListaCatalogosComponent implements AfterViewInit, OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<Catalogo>;
  displayedColumns = ["data_entrega","produtos","atual", "acoes"];
  datePipe: DatePipe; 
  formato: string;

  constructor(
    public catalogoService: CatalogoService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {
    this.datePipe = new DatePipe("pt-BR");
    this.formato = "dd/MM/yyyy";
  }
 
  ngOnInit() {
    this.catalogoService.listar().then((data) => {
      this.dataSource = new MatTableDataSource(data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;

      
      this.dataSource.sortingDataAccessor = (item, property) => {
        console.log(item)
        switch (property) {
          case 'data_entrega': {
            let d : firebase.firestore.Timestamp;
            d  = item.data_entrega as unknown as firebase.firestore.Timestamp;
            return new Date(d.toDate());
          }
          default: return item[property];
        }
      };
    });
  }

  ngAfterViewInit() {
  }

  adicionar() {
    this.router.navigate(["../catalogo", ""], {
      relativeTo: this.activatedRoute,
    });
  }

  editar(id) {
    this.router.navigate(["../catalogo", id], {
      relativeTo: this.activatedRoute,
    });
  }

  confirmDialog(m): void {
    const message = `Deseja excluir o catálogo?`;

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

  excluir(m: Catalogo) {
    if (m._id) {
      this.catalogoService.delete(m._id).then(() => {
        this.toastr.success("Catálogo excluído com sucesso", "Atenção!", {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
        this.catalogoService.listar().then((data) => {
          this.dataSource = new MatTableDataSource(data);
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
