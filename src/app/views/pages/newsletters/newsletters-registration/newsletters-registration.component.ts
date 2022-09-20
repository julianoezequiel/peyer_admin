import { MatDialog } from "@angular/material/dialog";
import {
  ConfirmDialogModel,
  ConfirmDialogComponent,
} from "./../../../../shared/confirm-dialog/confirm-dialog.component";
import { UsuarioService } from "./../../services/usuario.service";
import { ErrorFirebaseService } from "./../../../error/services/error-firebase.service";
import { AngularFireStorage } from "@angular/fire/storage";
import { UserFirebase } from "./../../model/user/userfirebase.model";
import { TranslateService } from "@ngx-translate/core";
import { ActivatedRoute } from "@angular/router";
import { NewsletterService } from "./../../services/newsletter.service";
import { ToastrService } from "ngx-toastr";
import { Router } from "@angular/router";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import {
  FileStructure,
  Newsletter,
} from "./../../model/newsletter/newsletter.model";
import { Subscription } from "rxjs/internal/Subscription";
import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import moment, { Moment } from "moment";
import _ from "lodash";

@Component({
  selector: "app-newsletters-registration",
  templateUrl: "./newsletters-registration.component.html",
  styleUrls: ["./newsletters-registration.component.scss"],
})
export class NewslettersRegistrationComponent implements OnInit {
  newsletterData: Newsletter = {
    _id: "",
    title: "",
    description: "",
    messageBody: "",
    attachments: [],
    publicationDate: "",
    authorID: "",
  };

  author = "";

  private subscriptions: Subscription[] = [];

  newsletterForm: FormGroup;

  pageTitle: string;
  disableBtn = false;

  minDate = new Date();
  disableDate = false;

  isNewRecord = true;
  msgError = "";

  // ATTACHMENTS AUX
  listFiles: {
    id: string;
    name: string;
    type: string;
    fileProperties?: {};
  }[] = [];

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private newsletterService: NewsletterService,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private userService: UsuarioService,
    private dialog: MatDialog
  ) {}

  async ngOnInit() {
    this.createForm();

    const routeSubscription = await this.activatedRoute.params.subscribe(
      async (params) => {
        const id = params.id;

        this.pageTitle = id ? "titulo.editarRegistro" : "titulo.novoRegistro";

        if (id && id.length > 0) {
          const material = await this.newsletterService
            .getById(id)
            .valueChanges();
          const subMaterial = await material.subscribe(async (value) => {
            this.newsletterData = value;

            this.listFiles = this.newsletterData.attachments;
            this.newsletterData._id = id;

            this.isNewRecord = false;

            // If the publication date is in the past,
            // then the author remains the same and uneditable on the publication date.
            if (
              moment(
                this.newsletterData.publicationDate,
                "DD/MM/YYYY"
              ).isBefore(moment(this.minDate, "DD/MM/YYYY"), "day")
            ) {
              this.disableDate = true;
              this.minDate = moment(
                this.newsletterData.publicationDate,
                "DD/MM/YYYY"
              ).toDate();

              const authorSub = await this.userService
                .getById(this.newsletterData.authorID)
                .valueChanges()
                .subscribe(async (value) => {
                  this.author = value.displayName;
                });

              this.subscriptions.push(authorSub);

              // Else the publish date is in the future then get the logged in user
            } else {
              const userLocal = (await JSON.parse(
                localStorage.getItem("user_firebase")
              )) as UserFirebase;

              this.newsletterData.authorID = userLocal.uid;
              this.author = userLocal.displayName;
            }

            this.createForm();
          });

          this.subscriptions.push(subMaterial);
        } else {
          const userLocal = (await JSON.parse(
            localStorage.getItem("user_firebase")
          )) as UserFirebase;

          this.newsletterData.authorID = userLocal.uid;
          this.author = userLocal.displayName;
          this.newsletterData.publicationDate = moment().format("DD/MM/YYYY");

          this.createForm();
        }
      }
    );
    this.subscriptions.push(routeSubscription);
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((x) => x.unsubscribe());
    this.dialog.closeAll();
  }

  goToList() {
    this.router.navigate(["../newsletters"], {});
  }

  async onSubmit() {
    const controls = this.newsletterForm.controls;

    /* check form */
    if (this.newsletterForm.invalid) {
      Object.keys(controls).forEach((controlName) => {
        controls[controlName].markAsTouched();
      });
      this.toastr.warning(
        this.translate.instant("cadastros.campo.existeInvalidos"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    }

    const newsletter: Newsletter = this.newsletterForm.value as Newsletter;

    newsletter._id = this.newsletterData._id;
    newsletter.publicationDate = moment(newsletter.publicationDate).format(
      "DD/MM/YYYY"
    );

    this.disableBtn = true;
    if (newsletter._id) {
      let confirmed = this.disableDate
        ? await this.confirmChangeNewsAlreadyPublished()
        : true;

      if (confirmed) {
        let uploaded = await this.uploadAttachments(newsletter).catch(
          () => (this.disableBtn = false)
        );

        this.update(newsletter);
      } else {
        this.disableBtn = false;
      }
    } else {
      newsletter.authorID = this.newsletterData.authorID;

      let uploaded = await this.uploadAttachments(newsletter).catch(
        () => (this.disableBtn = false)
      );

      this.add(newsletter);
    }
  }

  createForm() {
    this.newsletterForm = this.fb.group({
      title: [this.newsletterData.title, Validators.required],
      description: [this.newsletterData.description, Validators.required],
      messageBody: [this.newsletterData.messageBody, Validators.required],
      publicationDate: [
        moment(this.newsletterData.publicationDate, "DD/MM/YYYY"),
        Validators.required,
      ],
    });
  }

  add(newsletter: Newsletter) {
    this.newsletterService
      .create(newsletter)
      .then((x) => {
        this.toastr.success(
          this.translate.instant("mensagem.sucesso.adicionado"),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        this.goToList();
      })
      .catch((error) => {
        this.toastr.warning(error, this.translate.instant("alerta.atencao"), {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
      })
      .finally(() => (this.disableBtn = false));
  }

  update(newsletter: Newsletter) {
    this.newsletterService
      .update(newsletter, this.newsletterData)
      .then((x) => {
        this.toastr.success(
          this.translate.instant("mensagem.sucesso.alterado"),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        this.goToList();
      })
      .catch((error) => {
        this.toastr.warning(error, this.translate.instant("alerta.atencao"), {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
      })
      .finally(() => (this.disableBtn = false));
  }

  confirmChangeNewsAlreadyPublished() {
    return new Promise((resolve, reject) => {
      const message = this.translate.instant(
        "cadastros.newsletters.msg.confirmChangeNewsAlreadyPublished"
      );

      const dialogData = new ConfirmDialogModel(message);

      const dialogRef = this.dialog.open(ConfirmDialogComponent, {
        maxWidth: "400px",
        data: dialogData,
      });

      dialogRef.afterClosed().subscribe((dialogResult) => {
        resolve(dialogResult);
      });
    });
  }

  getDateMsg(): string {
    let msg = this.disableDate
      ? "cadastros.newsletters.msg.alreadyPublished"
      : "cadastros.newsletters.field.publicationDate";
    return this.translate.instant(msg);
  }

  getDateErrorMsg(): boolean {
    const ctrlDate = this.newsletterForm.controls["publicationDate"];
    this.msgError = "";

    if (ctrlDate.touched) {
      let date = moment(ctrlDate.value);
      if (ctrlDate.hasError("required") || !date.isValid()) {
        this.msgError = this.translate.instant("cadastros.campo.obrigatorio");
        return true;
      } else if (date.isBefore(moment(this.minDate, "DD/MM/YYYY"), "day")) {
        this.msgError = this.translate.instant(
          "cadastros.newsletters.msg.lowerDate"
        );
        return true;
      }
    }

    return false;
  }

  /*--------- ATTACHMENTS ---------*/
  async uploadAttachments(newsletter: Newsletter) {
    
    let newsSource: Newsletter;

    if (!this.isNewRecord) {
      newsSource = await (await this.newsletterService.getById(newsletter._id).get().toPromise()).data()
    }

    return new Promise(async (resolve, reject) => {
      if (this.listFiles) {
        if (this.listFiles.length > 0) {
          // Upload attachments in storage
          if (!newsletter.attachments) {
            newsletter.attachments = [];
          }

          let listFilesLength = this.listFiles.length;

          this.listFiles.forEach((file, index) => {

            let fileAlreadyExists = this.isNewRecord || !newsSource.attachments || newsSource.attachments.length == 0 ? true : newsSource.attachments.some((f) => f.id != file.id);
            
            if (fileAlreadyExists) {
              this.newsletterService
                .uploadAttachments(file)
                .then(() => {
                  delete file.fileProperties;
                  newsletter.attachments.push(file);

                  if (listFilesLength == newsletter.attachments.length) {
                    resolve(true);
                  }
                })
                .catch((error) => {
                  console.log(error);
                  this.toastr.warning(
                    this.translate.instant(
                      "cadastros.newsletters.msg.failedUploadAttachments",
                      {
                        value: file.name,
                      }
                    ),
                    this.translate.instant("alerta.atencao"),
                    {
                      closeButton: true,
                      progressAnimation: "decreasing",
                      progressBar: true,
                    }
                  );

                  if (index == this.listFiles.length - 1) {
                    reject(false);
                  }
                });
            } else {
              delete file.fileProperties;
              newsletter.attachments.push(file);

              if (listFilesLength == newsletter.attachments.length) {
                resolve(true);
              }
            }
          });
        } else {
          resolve(true);
        }
      } else {
        resolve(true);
      }
    });
  }

  uploadFileEvt(eventFiles: any) {
    if (eventFiles.target.files && eventFiles.target.files.length > 0) {
      if (!this.listFiles) {
        this.listFiles = [];
      }

      let eventFilesLength = eventFiles.target.files.length;
      let listFilesLength = this.listFiles.length;

      if (eventFilesLength + listFilesLength <= 2) {
        let filesValid = this.checkFilesFormat(eventFiles.target.files);

        if (filesValid) {
          Array.from(eventFiles.target.files).forEach((file: File) => {
            let id =
              Math.random().toString(36).substring(2, 10) +
              Math.random().toString(36).substring(2, 10);

            let obj = {
              id: id,
              name: file.name,
              type: file.type,
              fileProperties: file,
            };

            this.listFiles.push(obj);
          });

          // HTML5 FileReader API
          let reader = new FileReader();
          reader.onload = (e: any) => {
            let image = new Image();
            image.src = e.target.result;
            image.onload = (rs) => {
              let imgBase64Path = e.target.result;
              //this.dataimage = imgBase64Path;
            };
          };
          reader.readAsDataURL(eventFiles.target.files[0]);
        }
      } else {
        this.toastr.warning(
          this.translate.instant("cadastros.newsletters.msg.maxFiles"),
          this.translate.instant("alerta.atencao"),
          {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          }
        );
        return;
      }
    } else {
      //this.fileAttr = "Choose File";
    }
  }

  async removeFile(file: FileStructure) {
    if (this.newsletterData.attachments.some((f) => f.id == file.id)) {
      let fullPath = `newsletters/${file.id}_${file.name}`;

      //console.log("Removing in Storage... ", fullPath);
      let deleted = await this.newsletterService
        .deleteAttachmentStorage(fullPath)
        .then(() => {
          let attachmentsRemoved = this.newsletterData.attachments.filter(
            (f) => f.id != file.id
          );
          this.newsletterService.setAttachmentsDatabase(
            this.newsletterData._id,
            attachmentsRemoved
          );

          this.toastr.success(
            this.translate.instant("mensagem.sucesso.removido"),
            this.translate.instant("alerta.atencao"),
            {
              closeButton: true,
              progressAnimation: "decreasing",
              progressBar: true,
            }
          );
        })
        .catch((error) => {
          if (error.code == "object-not-found") {
            let attachmentsRemoved = this.newsletterData.attachments.filter(
              (f) => f.id != file.id
            );
            this.newsletterService.setAttachmentsDatabase(
              this.newsletterData._id,
              attachmentsRemoved
            );
          } else {
            this.toastr.warning(
              this.translate.instant("mensagem.falha.removido") +
                `\n- ${error}`,
              this.translate.instant("alerta.atencao"),
              {
                closeButton: true,
                progressAnimation: "decreasing",
                progressBar: true,
              }
            );
          }
        });
    }

    //console.log("Removing in list...");
    this.listFiles = this.listFiles.filter((f) => f.id != file.id);
  }

  checkFilesFormat(eventFiles): boolean {
    let filesValid = Array.from(eventFiles).every(
      (f: File) => f.type.includes("image/") || f.type == "application/pdf"
    );

    if (!filesValid) {
      this.toastr.warning(
        this.translate.instant("cadastros.newsletters.msg.fileInvalidFormat"),
        this.translate.instant("alerta.atencao"),
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
    }

    return filesValid;
  }

  openFolders() {
    document.getElementById("buttons").click();
  }
  /*--------- ATTACHMENTS ---------*/
}
