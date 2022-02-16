import { Component, OnInit } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ListaProdutosCatalogoComponent } from "./lista-produtos-catalogo/lista-produtos-catalogo.component";
import { Produto } from "../model/produto.model";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { Catalogo } from "../model/catalogo.model";
import { DiaSemana } from "../model/dia-semana.enum";
import { ToastrService } from "ngx-toastr";
import { CatalogoService } from "../services/catalogo.service";
import { Subscription } from "rxjs";
import { Pedido } from "../model/pedido.model";
import { PedidosService } from "../services/pedidos.service";
import { DatePipe } from "@angular/common";
import { CdkDragDrop, moveItemInArray } from "@angular/cdk/drag-drop";

@Component({
  selector: "app-catalogo",
  templateUrl: "./catalogo.component.html",
  styleUrls: ["./catalogo.component.css"],
})
export class CatalogoComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private catalogoService: CatalogoService,
    private activatedRoute: ActivatedRoute,
    private pedidosService: PedidosService
  ) {
    this.datePipe = new DatePipe("pt-BR");
  }

  private subscriptions: Subscription[] = [];

  datePipe: DatePipe;

  catalogoForm: FormGroup;
  list: Produto[] = [];
  pedidos: Pedido[] = [];
  catalogo: Catalogo;
  dia_semana: DiaSemana[] = [];

  ngOnInit(): void {
    this.dia_semana.push(DiaSemana.QUINTA);
    this.dia_semana.push(DiaSemana.SEXTA);
    this.dia_semana.push(DiaSemana.SABADO);
    this.catalogo = {
      _id: null,
      produtos: [],
      data_entrega: new Date(),
      data_string: "",
      dia_confirmar: DiaSemana.SEXTA,
      hora_confirmar: "14h",
      hora_inicio_entrega: "14h",
      pedidos: [],
      atual: false,
      numero_wpp: "04197414574",
    };

    this.createForm();
    const routeSubscription = this.activatedRoute.params.subscribe((params) => {
      const id = params.id;
      if (id && id.length > 0) {
        const material = this.catalogoService.read(id).valueChanges();
        material.subscribe((value) => {
          this.catalogo._id = value._id;
          this.catalogo.dia_confirmar = value.dia_confirmar;
          this.catalogo.hora_confirmar = value.hora_confirmar;
          this.catalogo.hora_inicio_entrega = value.hora_inicio_entrega;
          this.catalogo.produtos = value.produtos;
          this.catalogo.data_entrega = new Date(
            value.data_entrega.seconds * 1000
          );
          this.catalogo._id = id;
          this.catalogo.atual = value.atual;
          this.catalogo.numero_wpp = value.numero_wpp;
          this.list = this.catalogo.produtos;

          this.createForm();
        });
      }
    });
    this.subscriptions.push(routeSubscription);
  }

  createForm() {
    this.catalogoForm = this.fb.group({
      _id: [this.catalogo._id],
      data_entrega: [new Date(this.catalogo.data_entrega), Validators.required],
      dia_confirmar: [this.catalogo.dia_confirmar, Validators.required],
      hora_confirmar: [this.catalogo.hora_confirmar, Validators.required],
      hora_inicio_entrega: [
        this.catalogo.hora_inicio_entrega,
        Validators.required,
      ],
      atual: [this.catalogo.atual],
      numero_wpp: [this.catalogo.numero_wpp, Validators.required],
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ListaProdutosCatalogoComponent, {
      // width: "250px",
      data: this.list,
    });

    dialogRef.afterClosed().subscribe((result: Produto[]) => {
      if (result.length > 0) {
        this.list = result;
      }
    });
  }

  remover(p: Produto) {
    let index = this.list.indexOf(p);
    this.list.splice(index, 1);
  }

  voltar() {
    this.router.navigate(["lista-de-catalogo"], {});
  }

  async onSubmit() {
    const controls = this.catalogoForm.controls;
    let existeAtual: boolean = false;
    /** check form */
    if (this.catalogoForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    await this.catalogoService.buscarAtual().then((a) => {
      if (a.length > 0) {
        a.forEach((aa: Catalogo) => {
          if (aa._id != this.catalogo._id && aa.atual == true) {
            existeAtual = true;
          }
        });
      }
    });

    if (existeAtual && this.catalogo.atual) {
      this.toastr.warning(
        "Existe um catálogo em uso,desative o catálogo anterior!",
        "Atenção!",
        {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        }
      );
      return;
    }

    if (this.list.length == 0) {
      this.toastr.warning("Adicione produtos ao catálogo!", "Atenção!", {
        closeButton: true,
        progressAnimation: "decreasing",
        progressBar: true,
      });
      return;
    } else {
      this.list.forEach((f) => {
        if (f.cod_fornecedor == undefined) {
          f.cod_fornecedor = "";
        }
        if(f.index==undefined){
          f.index=0;
        }
      });
    }

    const prod: Catalogo = this.prepareCatalogo();

    if (prod._id && prod._id != "") {
      this.updateCatalogo(prod);
      return;
    }

    this.addCatalogo(prod);
  }

  addCatalogo(prod: Catalogo) {
    this.catalogoService.create(prod).then((result) => {
      this.toastr.success("Catálogo cadastrado com sucesso", "Atenção!", {
        closeButton: true,
        progressAnimation: "decreasing",
        progressBar: true,
      });
      this.router.navigate(["../lista-de-catalogo"], {});
    });
  }

  updateCatalogo(prod: Catalogo) {
    this.catalogoService.update(prod._id, prod).then((result) => {
      this.toastr.success("Catálogo atualizado com sucesso", "Atenção!", {
        closeButton: true,
        progressAnimation: "decreasing",
        progressBar: true,
      });
      this.router.navigate(["../lista-de-catalogo"], {});
    });
  }

  prepareCatalogo(): Catalogo {
    const controls = this.catalogoForm.controls;

    const catalogo: Catalogo = {
      _id: controls._id.value,
      produtos: this.list,
      data_entrega: controls.data_entrega.value,
      data_string: "",
      dia_confirmar: controls.dia_confirmar.value,
      hora_confirmar: controls.hora_confirmar.value,
      hora_inicio_entrega: controls.hora_inicio_entrega.value,
      pedidos: this.pedidos,
      atual: controls.atual.value,
      numero_wpp: controls.numero_wpp.value,
    };

    return catalogo;
  }

  gerarTotal() {
    let listaProd: Produto[] = [];

    this.pedidosService.buscarPorCatalogo(this.catalogo._id).then((p) => {
      p.forEach((ped: Pedido) => {
        ped.produto_pedido.forEach((prod: Produto) => {
          listaProd.push(prod);
        });
      });

      let relatorio: string =
        "Totais Pedidos do Catálogo de " +
        this.datePipe.transform(
          this.catalogo.data_entrega,
          "dd/MM/yyyy HH:mm"
        ) +
        "\n\r";

      let g = this.groupBy(listaProd, "cod_fornecedor");
      let r: any[] = Object.values(g);
      r.forEach((e) => {
        let pe: Produto[] = e as Produto[];
        let cod_for: string = "";
        if (pe.length > 0) {
          cod_for = pe[0].cod_fornecedor
            ? pe[0].cod_fornecedor
            : "Não definido";
        }
        relatorio += "Fornecedor: " + cod_for + "\n\r";

        let result: Produto[] = [];
        pe.reduce(function (res, value) {
          if (!res[value._id]) {
            res[value._id] = {
              _id: value._id,
              quantidade: 0,
              unidade_medida: value.unidade_medida,
              descricao: value.descricao,
            };
            result.push(res[value._id]);
          }
          res[value._id].quantidade += value.quantidade;
          return res;
        }, {});

        // console.log(result);

        result.forEach((s) => {
          relatorio +=
            "\t" +
            s.descricao +
            " - qtd: " +
            s.quantidade +
            s.unidade_medida.descricao +
            "\n";
        });

        relatorio += "\n\r";
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
    });
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

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.list, event.previousIndex, event.currentIndex);
  }
}
