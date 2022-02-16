import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ListaUsuariosDataSource, ListaUsuariosItem } from './lista-usuarios-datasource';
import { UserFirebase } from '../../login/userfirebase.model';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { UsuarioService } from '../services/usuario.service';
import { AuthService } from '../../login/auth.service';
import { ConfirmDialogModel, ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'lista-usuarios',
  templateUrl: './lista-usuarios.component.html',
  styleUrls: ['./lista-usuarios.component.css']
})
export class ListaUsuariosComponent implements AfterViewInit, OnInit {

  constructor( public dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    public auth: AuthService){}

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  dataSource: MatTableDataSource<UserFirebase>;

  data :UserFirebase[];

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ['displayName','email','acoes'];

  async ngOnInit() {
    await this.usuarioService.listar().then((data)=>{
      this.data = data;      
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  ngAfterViewInit() {
   
  }

  adicionar() {
    this.router.navigate(["../cadastro-usuario"], {
      relativeTo: this.activatedRoute,
    });
  }

  editar(id) {
    this.router.navigate(["../cadastro-usuario", id], {
      relativeTo: this.activatedRoute,
    });
  }

  confirmDialog(m): void {
    const message = `Deseja excluir o usuário?`;

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

  excluir(m: UserFirebase) {
    if (m.uid) {
      // this.auth.excluir(m.uid).then(()=>{
        this.usuarioService.delete(m.uid).then(() => {
          this.toastr.success("Usuário excluído com sucesso", "Atenção!", {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          });
          this.usuarioService.listar().then((data)=>{
            this.data = data;      
            this.dataSource = new MatTableDataSource(this.data);
            this.dataSource.sort = this.sort;
            this.dataSource.paginator = this.paginator;
          });
        });
      // }).catch(()=>{
      //   this.toastr.warning("Não foi possível excluir o usuário", "Atenção!", {
      //     closeButton: true,
      //     progressAnimation: "decreasing",
      //     progressBar: true,
      //   });
      // });
     
    }
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}
