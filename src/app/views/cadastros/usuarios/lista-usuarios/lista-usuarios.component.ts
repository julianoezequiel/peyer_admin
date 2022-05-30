import { Component, OnInit, ViewChild } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { FormBuilder } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from "../../../confirm-dialog/confirm-dialog.component";
import { AuthService } from "../../../login/auth.service";
import { UserFirebase } from "../../model/userfirebase.model";
import { UsuarioService } from "../../services/usuario.service";
import { rowsAnimation } from "./../../../../shared/animations";

@Component({
  selector: "lista-usuarios",
  templateUrl: "./lista-usuarios.component.html",
  styleUrls: ["./lista-usuarios.component.scss"],
  animations: [rowsAnimation],
})
export class ListaUsuariosComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private usuarioService: UsuarioService,
    private activatedRoute: ActivatedRoute,
    public auth: AuthService,
    public afAuth: AngularFireAuth,
    public translate: TranslateService
  ) {}

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<UserFirebase>;

  data: UserFirebase[];

  /** Columns displayed in the table. Columns IDs can be added, removed, or reordered. */
  displayedColumns = ["displayName", "email", "jobTitle", "birthDate", "acoes"];

  async ngOnInit() {
    await this.getAll();
  }

  adicionar() {
    this.router.navigate(["../users/user"], {
      relativeTo: this.activatedRoute,
    });
  }

  async editar(user: UserFirebase) {

    let userValid = await this.checkOwnUser(user);

    if (userValid) {
      this.router.navigate(["../users/user/", user.uid], {
        relativeTo: this.activatedRoute,
      });
    }
  }

  async getAll() {
    await this.usuarioService.read_all().subscribe((data) => {
      let lista: UserFirebase[] = data.map((e) => {
        return {
          uid: e.payload.doc.data()["uid"],
          email: e.payload.doc.data()["email"],
          displayName: e.payload.doc.data()["displayName"],
          photoURL: e.payload.doc.data()["photoURL"],
          password: e.payload.doc.data()["password"],
          jobTitle: e.payload.doc.data()["jobTitle"],
          birthDate: e.payload.doc.data()["birthDate"],
          contact: e.payload.doc.data()["contact"],
          permissions: e.payload.doc.data()["permissions"],
          emergencyContacts: e.payload.doc.data()["emergencyContacts"],
        };
      });

      this.data = lista;
      this.dataSource = new MatTableDataSource(this.data);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
  }

  async excluir(user: UserFirebase) {
    if (user.uid) {
      let userValid = await this.checkOwnUser(user);

      if (userValid) {
        this.usuarioService
          .delete(user)
          .then(() => {
            this.toastr.success(
              this.translate.instant("mensagem.sucesso.removido"),
              this.translate.instant("alerta.atencao"),
              {
                closeButton: true,
                progressAnimation: "decreasing",
                progressBar: true,
              }
            );
            this.getAll();
          })
          .catch((error) => {
            this.toastr.warning(
              this.translate.instant("mensagem.falha.removido"),
              this.translate.instant("alerta.atencao"),
              {
                closeButton: true,
                progressAnimation: "decreasing",
                progressBar: true,
              }
            );
          });
      }
    }
  }

  async checkOwnUser(user: UserFirebase): Promise<any> {
    return this.afAuth.currentUser.then((res) => {
      if (res.uid == user.uid) {
        this.toastr.warning(
          this.translate.instant(
            "cadastros.usuarios.msg.alterar-proprio-usuario"
          ),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        return null;
      } else {
        return res;
      }
    });
  }

  confirmDialog(m): void {
    const message = this.translate.instant("mensagem.confirmar");

    const dialogData = new ConfirmDialogModel(message);

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

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}
