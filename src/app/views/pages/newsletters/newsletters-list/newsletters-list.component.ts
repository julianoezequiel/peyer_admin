import { FormControl, Validators } from "@angular/forms";
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import moment, { Moment } from "moment";
import { ToastrService } from "ngx-toastr";
import { Subscription } from "rxjs";

import { ErrorFirebaseService } from "../../../error/services/error-firebase.service";
import { rowsAnimation } from "./../../../../shared/animations";
import {
  ConfirmDialogComponent,
  ConfirmDialogModel,
} from "./../../../../shared/confirm-dialog/confirm-dialog.component";
import { Newsletter } from "./../../model/newsletter/newsletter.model";
import { NewsletterService } from "./../../services/newsletter.service";
import { UsuarioService } from "./../../services/usuario.service";
import { NewsDetailsDialog } from "./news-details-dialog/news-details-dialog.component";

@Component({
  selector: "app-newsletters-list",
  templateUrl: "./newsletters-list.component.html",
  styleUrls: ["./newsletters-list.component.scss"],
  animations: [rowsAnimation],
})
export class NewslettersListComponent implements OnInit, OnDestroy {
  
  private subscriptions: Subscription[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  dataSource: MatTableDataSource<{ news: Newsletter; author: string }>;
  displayedColumns = [
    "title",
    "description",
    "publicationDate",
    "author",
    "actions",
  ];

  loading = true;

  data: Newsletter[];

  beginDate = new FormControl();
  endDate = new FormControl();

  @ViewChild("searchFilter", { static: true }) searchFilter: ElementRef<HTMLInputElement>;
  
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private newsletterService: NewsletterService,
    private errorFB: ErrorFirebaseService,
    public translate: TranslateService,
    public dialog: MatDialog,
    private toastr: ToastrService,
    private userService: UsuarioService
  ) {}

  ngOnInit() {
    this.getAll();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
    this.dialog.closeAll();
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
        let newslettersList: { news: Newsletter; author: string }[] = [];

        data.forEach(async (e) => {
          let newsletter = e.payload.doc.data() as Newsletter;
          newsletter._id = e.payload.doc.id;

          let author = "";

          const authorSub = await this.userService
            .getById(newsletter.authorID)
            .valueChanges()
            .subscribe(async (value) => {
              author = value.displayName;

              newslettersList.push({ news: newsletter, author: author });

              // refresh data
              this.dataSource.filter = " ";
            });

          this.subscriptions.push(authorSub);
        });

        this.initTable(newslettersList);

        this.loading = false;
      },

      (error) => {
        console.log(error);
        return this.errorFB.getErrorByCode(error);
      }
    );

    this.subscriptions.push(subList);
  }

  initTable(list) {
    this.dataSource = new MatTableDataSource(list);
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Custom sort when nested object
    this.dataSource.sortingDataAccessor = (data, sort) => {
      if (sort == "title") {
        return data.news.title.toLowerCase();
      } else if (sort == "description") {
        return data.news.description.toLowerCase();
      } else if (sort == "publicationDate") {
        return moment(data.news.publicationDate, ["DD/MM/YYYY"]).unix();
      } else if (sort == "author") {
        return data.author.toLowerCase();
      }
    };

    // Custom filter when nested object
    this.dataSource.filterPredicate = (data, filter) => {

      filter = filter.toLowerCase().trim();

      let filterReturn =
        data.news.title.toLowerCase().includes(filter) ||
        data.news.description.toLowerCase().includes(filter) ||
        data.news.publicationDate.includes(filter) ||
        data.author.toLowerCase().includes(filter);

      if ((this.beginDate.value && this.beginDate.value.isValid()) && (this.endDate.value && this.endDate.value.isValid())) {
        
        let beginDate: Moment = this.beginDate.value;
        let endDate: Moment = this.endDate.value;
        let publicationDate: Moment = moment(data.news.publicationDate, ["DD/MM/YYYY"]);

        return (filterReturn && (publicationDate.isSameOrAfter(beginDate) && publicationDate.isSameOrBefore(endDate)));
      } else {
        return filterReturn;
      }
    };
  }

  viewNewsDetails(row) {
    const dialogRef = this.dialog.open(NewsDetailsDialog, {
      width: "500px",
      height: "490px",
      data: row,
      panelClass: "news-details-dialog",
    });
  }

  confirmDialog(row: Newsletter): void {
    const message = this.translate.instant("mensagem.confirmar");

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

  applyFilter() {
    const filter = this.searchFilter.nativeElement.value;
    this.dataSource.filter = filter ? filter : " ";
  }
}
