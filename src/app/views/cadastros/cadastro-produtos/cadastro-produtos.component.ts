import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Produto } from "../model/produto.model";
import { unidades, UnidadeMedida } from "../model/unidade-medida";
import { ProdutosService } from "../services/produtos.service";
import { ToastrService } from "ngx-toastr";
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription, BehaviorSubject } from 'rxjs';

@Component({
  selector: "cadastro-produtos",
  templateUrl: "./cadastro-produtos.component.html",
  styleUrls: ["./cadastro-produtos.component.css"],
})
export class CadastroProdutosComponent implements OnInit {
  
  private subscriptions: Subscription[] = [];
  titulo: BehaviorSubject<string> = new BehaviorSubject<string>("");

  medidas: UnidadeMedida[];
  produtoForm: FormGroup;
  produto: Produto = {
    _id: "",
    descricao: "",
    observacao: "",
    unidade_medida: unidades[2],
    valorA: 0,
    valorB: 0,
    limite: 0,
    quantidade:0,
    valor_total:0,
    index:0,
    cod_fornecedor:""
  };

  constructor(
    private fb: FormBuilder,
    private produtosService: ProdutosService,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) {
    this.medidas = unidades;
  }

  ngOnInit() {
    this.createForm();
    const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id && id.length > 0) {
					const material = this.produtosService
						.read(id)
            .valueChanges();            
					material.subscribe((value) => {
						this.produto = value;
						this.produto._id = id;
            this.titulo.next(`Editar - ${this.produto.descricao}`)	;	
            this.createForm();
					});						
				} else{
					this.titulo.next("Novo");
				}
			}
		);
		this.subscriptions.push(routeSubscription);
  }

  createForm() {
    this.produtoForm = this.fb.group({
      _id: [this.produto._id],
      descricao: [this.produto.descricao, Validators.required],
      observacao: [this.produto.descricao],
      valorA: [this.produto.valorA, Validators.required],
      valorB: [this.produto.valorB],
      limite: [this.produto.limite],
      unidade_medida: [this.produto?.unidade_medida?.id, Validators.required],
      cod_fornecedor:[this.produto.cod_fornecedor]
    });
  }

  onSubmit() {
    const controls = this.produtoForm.controls;
    /** check form */
    if (this.produtoForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    const prod: Produto = this.prepareProduto();

    if (prod._id) {
      this.updateProduto(prod);
      return;
    }

    this.addproduto(prod);
  }

  addproduto(prod: Produto) {
    this.produtosService.create(prod).then((result) => {
      this.toastr.success("Produto cadastrado com sucesso", "Atenção!", {
        closeButton: true,
        progressAnimation: "decreasing",
        progressBar: true,
      });
      this.router.navigateByUrl("lista-de-produtos", {
        relativeTo: this.activatedRoute,
      });
    });
  }

  updateProduto(prod: Produto) {
    this.produtosService.update(prod._id, prod).then((result) => {
      this.toastr.success("Produto atualizado com sucesso", "Atenção!", {
        closeButton: true,
        progressAnimation: "decreasing",
        progressBar: true,
      });
      this.router.navigateByUrl("lista-de-produtos", {
        relativeTo: this.activatedRoute,
      });
    });
  }

  prepareProduto(): Produto {
    const controls = this.produtoForm.controls;
    const produto: Produto = {
      _id: controls._id.value,
      descricao: controls.descricao.value,
      valorA: controls.valorA.value,
      valorB: controls.valorB.value,
      limite: controls.limite.value,
      observacao: controls.observacao.value,
      unidade_medida: this.medidas[controls.unidade_medida.value -1],
      quantidade:0,
      valor_total:0,
      index:0,
      cod_fornecedor:controls.cod_fornecedor.value
    };

    return produto;
  }

  voltar(){
    this.router.navigate(["../lista-de-produtos"], {});
  }
}
