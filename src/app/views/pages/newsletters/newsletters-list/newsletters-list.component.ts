import { NewsDetailsDialog } from './news-details-dialog/news-details-dialog.component';
import { NewsletterService } from './../../services/newsletter.service';
import { Newsletter } from './../../model/newsletter/newsletter.model';
import { ConfirmDialogModel, ConfirmDialogComponent } from './../../../../shared/confirm-dialog/confirm-dialog.component';
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { ToastrService } from "ngx-toastr";

import { ErrorFirebaseService } from "../../../error/services/error-firebase.service";
import { VehicleService } from "../../services/vehicle.service";
import { rowsAnimation } from "./../../../../shared/animations";
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subscription } from 'rxjs';
import { Vehicle } from '../../model/vehicle/vehicle.model';

@Component({
  selector: "app-newsletters-list",
  templateUrl: "./newsletters-list.component.html",
  styleUrls: ["./newsletters-list.component.scss"],
  animations: [rowsAnimation],
})
export class NewslettersListComponent implements OnInit, OnDestroy {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private newsletterService: NewsletterService,
    private errorFB: ErrorFirebaseService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private toastr: ToastrService
  ) {}

  private subscriptions: Subscription[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<Newsletter>;
  displayedColumns = [
    "title",
    "description",
    "publicationDate",
    "author",
    "actions",
  ];

  dataEmpty = true;
  loading = true;

  data: Newsletter[];

  ngOnInit() {
    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
  }

  add() {
    this.router.navigate(["../newsletters/news"], {
      relativeTo: this.activatedRoute,
    });
  }

  edit(newsletter: Newsletter) {
    this.router.navigate(["../newsletters/news/", newsletter._id], {
      relativeTo: this.activatedRoute,
    });
  }

  async delete(newsletter: Newsletter) {
    if (newsletter._id) {
      this.newsletterService
        .delete(newsletter)
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
            this.translate.instant("mensagem.falha.removido") + `\n- ${error}`,
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

  async getAll() {
    const subList = this.newsletterService.getAll().subscribe(
      (data) => {
        let newslettersList: Newsletter[] = [];
        
        newslettersList = data.map((e) => {
          let newsletter = e.payload.doc.data() as Newsletter;
          newsletter._id = e.payload.doc.id;

          return newsletter;
        });

        this.dataEmpty = newslettersList.length == 0;

        this.dataSource = new MatTableDataSource(newslettersList);
        this.dataSource.sort = this.sort;
        this.dataSource.paginator = this.paginator;

        this.loading = false;
      },

      (error) => {
        console.log(error);
        return this.errorFB.getErrorByCode(error);
      }
    );

    this.subscriptions.push(subList);
  }

  viewNewsDetails(row: Newsletter) {
    const dialogRef = this.dialog.open(NewsDetailsDialog, {
      width: "410px",
      height: "490px",
      data: row,
      panelClass: 'news-details-dialog'
    });
  }

  confirmDialog(row: Newsletter): void {
    const message = this.translate.instant("cadastros.vehicles.msg.deleteVehicleOnRoute");

    const dialogData = new ConfirmDialogModel(message);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: "400px",
      data: dialogData,
    });

    dialogRef.afterClosed().subscribe((dialogResult) => {
      if (dialogResult == true) {
        this.delete(row);
      }
    });
  }

  applyFilter(filterValue: string) {
    filterValue = filterValue.trim(); // Remove whitespace
    filterValue = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = filterValue;
  }
}
