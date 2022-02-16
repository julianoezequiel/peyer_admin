import { Component, OnInit, OnDestroy } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { ProdutosService } from "../services/produtos.service";
import { MatDialog } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { ToastrService } from "ngx-toastr";
import { CatalogoService } from "../services/catalogo.service";
import { Subscription } from "rxjs";
import { Pedido } from "../model/pedido.model";
import { DiaSemana } from "../model/dia-semana.enum";
import { FormasPagamentos } from "../model/formas-pagamento.enum";
import { Status } from "../model/status.enum";
import { Catalogo } from "../model/catalogo.model";
import { PedidosService } from "../services/pedidos.service";
import { Produto } from "../model/produto.model";
import { UnidadeMedida, unidades } from "../model/unidade-medida";
import { PedidosHistoricoService } from "../services/pedidos-historico.service";
import { Cliente } from '../model/cliente.model';
import { ClientesService } from "../services/clientes.service";
import { ListaClientesBuscaComponent } from "./lista-clientes-busca/lista-clientes-busca.component";
import { CurrencyPipe, DatePipe } from "@angular/common";


@Component({
  selector: "cadastro-pedidos",
  templateUrl: "./cadastro-pedidos.component.html",
  styleUrls: ["./cadastro-pedidos.component.css"],
})
export class CadastroPedidosComponent implements OnInit ,OnDestroy{
  private subscriptions: Subscription[] = [];

  somentePedido:boolean;
  datePipe: DatePipe;
  produtosCatalogoOriginal:Produto[]  ;
  produtosPedidos:Produto[]  ;
  forma_pagamento: FormasPagamentos[] = [];
  pedidoForm: FormGroup;
  dia_semana: DiaSemana[] = [];
  produtos_disponoveis: Produto[] = [];
  total: number = 0;
  loading = true;
  pedido: Pedido = {
    _id: "",
    data: new Date(),
    dia_entrega: DiaSemana.SABADO,
    forma_pagamento: FormasPagamentos.DINHEIRO,
    numero_celular: "",
    pago: false,
    produto_pedido: [],
    status: Status.EM_ANDAMENTO,
    total_pedido: 0,
    catalogo: null,
    cliente:null,
  };

  catalogoAtual: Catalogo;
  cliente:Cliente;

  constructor(
    private fb: FormBuilder,
    public produtosService: ProdutosService,
    public dialog: MatDialog,
    private router: Router,
    private toastr: ToastrService,
    private catalogoService: CatalogoService,
    private activatedRoute: ActivatedRoute,
    private pedidosService: PedidosService,
    private pedidosHistoricoService: PedidosHistoricoService,
    private clienteService:ClientesService,
    private currencyPipe:CurrencyPipe
  ) {
    this.datePipe = new DatePipe("pt-BR");
    this.produtosCatalogoOriginal = [];
    this.produtosPedidos = [];
    this.somentePedido = false;
  }

  ngOnDestroy(): void {
    this.loading = false;
  }

  ngOnInit() {
    this.cliente = {
      _id:'',
      complemento:'',
      endereco:'',
      nome:'',
      numero:'',
      numero_celular:''
    };
    // this.dia_semana.push(DiaSemana.QUINTA);
    this.dia_semana.push(DiaSemana.SEXTA);
    this.dia_semana.push(DiaSemana.SABADO);
    this.forma_pagamento.push(FormasPagamentos.BOLETO);
    this.forma_pagamento.push(FormasPagamentos.DEBITO);
    this.forma_pagamento.push(FormasPagamentos.DINHEIRO);
    this.forma_pagamento.push(FormasPagamentos.TRANFERENCIA);
    this.createForm();

    this.createForm();
    this.catalogoService.buscarAtual().then((c) => {
      if (c.length > 0) {
        this.catalogoAtual = c[0];
        this.produtosCatalogoOriginal = this.catalogoAtual.produtos;

        const routeSubscription = this.activatedRoute.params.subscribe((params) => {
          const id = params.id;
          if (id && id.length > 0) {
            const material = this.pedidosService.read(id).valueChanges();
            material.subscribe((value) => {
              this.pedido._id = id;
              if(value){
                this.pedido.data = value?.data;
                this.pedido.dia_entrega = value?.dia_entrega;
                this.pedido.forma_pagamento = value?.forma_pagamento;
                this.pedido.numero_celular = value?.cliente?.numero_celular;
                this.pedido.pago = value?.pago;
                this.pedido.produto_pedido = value?.produto_pedido;
                this.pedido.status = value?.status;
                this.pedido.total_pedido = value?.total_pedido;
                this.pedido.catalogo = value?.catalogo;    
                this.catalogoAtual.produtos = this.pedido.produto_pedido;              
                             
                this.cliente = value?.cliente
                this.calculaTotal();
              }
              this.createForm();
              this.loading = false;
            });
          } else {
            this.listarCatAtual();
            this.loading = false;
          }
        });
        this.subscriptions.push(routeSubscription);
      } else {
        this.createForm();
        this.loading = false;
      }
    });
    
    // this.clienteService.buscarPorNumeroCelular()
  }

  changeSomentePedidos(){

    if(this.somentePedido){
      // this.catalogoAtual.produtos = this.pedido.produto_pedido;              
      let produtosPedido:Produto[] = this.pedido.produto_pedido;
      if(produtosPedido && produtosPedido.length>0){
        this.catalogoAtual.produtos.forEach(p => {
          produtosPedido.forEach(pp=>{
            if(p._id==pp._id){
              p.quantidade = pp.quantidade;
              p.valor_total = pp.valor_total;                        
            }
          })
        });  
      } 
    }else{

    }
  }

  listarCatAtual() {
    this.catalogoService.buscarAtual().then((c) => {
      if (c.length > 0) {
        this.catalogoAtual = c[0];
      } else {
        this.router.navigate(["error"]);
      }
    });
  }

  onSubmit() {
    const controls = this.pedidoForm.controls;
    let existeAtual: boolean = false;
    /** check form */
    if (this.pedidoForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    const prod: Pedido = this.preparePedido();

    if (prod._id) {
      this.updatePedido(prod);
      return;
    }

    this.addPedido(prod);
  }

  addPedido(p: Pedido) {
    this.loading = true;
    if (p.pago==true) {
      this.pedidosService.delete(p._id).then(()=>{
        this.pedidosHistoricoService.create(p).then(()=>{
          this.toastr.success("Pedido enviado para o histórico", "Atenção!", {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          });
          this.router.navigate(["lista-de-pedidos"], {});
        });
      });
    } else {
      this.pedidosService.create(p).then(() => {
        this.toastr.success("Pedido cadastrado com sucesso", "Atenção!", {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
        this.router.navigate(["lista-de-pedidos"], {});
      });
    }
  }
  updatePedido(p: Pedido) {
    this.loading = true;
    if (p.pago == "true" || p.pago == true)  {
      this.pedidosService.delete(p._id).then(()=>{
        this.pedidosHistoricoService.create(p).then(()=>{
          this.toastr.success("Pedido enviado para o histórico", "Atenção!", {
            closeButton: true,
            progressAnimation: "decreasing",
            progressBar: true,
          });
          this.router.navigate(["lista-de-pedidos"], {});
        });
      });
    } else {
      this.pedidosService.update(p._id, p).then(() => {
        this.toastr.success("Pedido atualizado com sucesso", "Atenção!", {
          closeButton: true,
          progressAnimation: "decreasing",
          progressBar: true,
        });
        this.router.navigate(["lista-de-pedidos"], {});
      });
    }
  }
  preparePedido(): Pedido {
    const controls = this.pedidoForm.controls;

    const p: Pedido = {
      _id: controls._id.value,
      data: controls.data.value,
      dia_entrega: controls.dia_entrega.value,
      forma_pagamento: controls.forma_pagamento.value,
      numero_celular: this.cliente.numero_celular,
      pago: controls.pago.value,
      produto_pedido: [],
      status: controls.status.value,
      total_pedido: controls.total_pedido.value,
      catalogo: this.catalogoAtual,
      cliente:this.cliente
    };

    p.produto_pedido = this.catalogoAtual.produtos.filter((p: Produto) => {
      return p.quantidade > 0;
    });

    p.total_pedido = this.total;

    delete this.catalogoAtual.produtos;
    delete this.catalogoAtual.pedidos;

    return p;
  }

  createForm() {
    this.pedidoForm = this.fb.group({
      _id: [this.pedido._id],
      data: [this.pedido.data, Validators.required],
      dia_entrega: [this.pedido.dia_entrega],
      numero_celular: [this.cliente.numero_celular],
      pago: [this.pedido.pago],
      produto_pedido: [this.pedido.produto_pedido],
      status: [this.pedido?.status, Validators.required],
      total_pedido: [this.pedido?.total_pedido, Validators.required],
      forma_pagamento: [this.pedido?.forma_pagamento, Validators.required],
      nome:[this.cliente.nome],
      endereco:[this.cliente.endereco],
      numero:[this.cliente.numero],
      complemento:[this.cliente.complemento]
    });
  }

  voltar() {
    window.history.back();
  }

  atualizarCat() {
    this.catalogoService
      .update(this.catalogoAtual._id, this.catalogoAtual)
      .then(() => {});
  }

  decrementarProd(p: Produto) {
    if (p.quantidade && p.quantidade > 0) {
      p.quantidade--;
    } else {
      p.quantidade = 0;
    }
    this.calculaValor(p);
  }

  incrementarProd(p: Produto) {
    if (p.quantidade) {
      p.quantidade++;
    } else {
      p.quantidade = 0;
      p.quantidade++;
    }
    this.calculaValor(p);
  }

  calculaValor(p: Produto) {
    if (p.limite > 0 && p.quantidade >= p.limite) {
      p.valor_total = p.valorB * p.quantidade;
    } else {
      p.valor_total = p.valorA * p.quantidade;
    }
    this.calculaTotal();
  }

  convertToProdutoPedido(p: Produto) {
    let pd: Produto = {
      _id: "",
      descricao: "",
      limite: 0,
      observacao: "",
      quantidade: 0,
      unidade_medida: p.unidade_medida,
      valorA: 0,
      valorB: 0,
      valor_total: 1,
      index:p.index,
      cod_fornecedor:p.cod_fornecedor
    };
  }

  tipoUnidademedida(p: Produto) {
    if (p.limite > 0 && p.quantidade >= p.limite && p.unidade_medida.id == 1) {
      p.unidade_medida = unidades[2];
    }
    return p.unidade_medida.descricao;
  }

  calculaTotal() {
    this.total = 0;
    this.catalogoAtual.produtos.forEach((p: Produto) => {
      if (p.valor_total) {
        this.total = this.total + p.valor_total;
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ListaClientesBuscaComponent, {
      // width: "250px",
      width: '600px',
      data: {},
    });

    dialogRef.afterClosed().subscribe((result: Cliente) => {
      if (result) {
        this.cliente = result;
        console.log(this.cliente);
        this.createForm();
      }
    });
  }

  gerarRelatorio() {
    let listaProd: Pedido[] = [];

    this.pedidosService.buscarPorId(this.pedido._id).then((p) => {

      let  relatorio : string = "Nome: " + p.cliente.nome + "\n";

      relatorio += "Endereço: " + p.cliente.endereco + " - Nº: " + p.cliente.numero + "\n";
      relatorio += "Complemento: " + p.cliente.complemento;
      relatorio += "Cel: " + p.cliente.numero_celular + "\n\r";

      let detPedido :string='';
      p.produto_pedido.forEach((pd)=>{
        detPedido += pd.quantidade + ' ' + new String(pd.descricao) + ' ' + this.currencyPipe.transform(pd.valor_total,'BRL') + "\n";
      });

      relatorio += detPedido + '\n';
      relatorio += "Total : " + this.currencyPipe.transform(p.total_pedido,'BRL') 
      relatorio += "\n\r";

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
}
