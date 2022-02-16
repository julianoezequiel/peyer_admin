import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, Subscription } from 'rxjs';
import { Cliente } from '../model/cliente.model';
import { ClientesService } from '../services/clientes.service';

@Component({
  selector: 'app-cadastro-clientes',
  templateUrl: './cadastro-clientes.component.html',
  styleUrls: ['./cadastro-clientes.component.css']
})
export class CadastroClientesComponent implements OnInit {

  private subscriptions: Subscription[] = [];
  titulo: BehaviorSubject<string> = new BehaviorSubject<string>("");
  
  clienteForm: FormGroup;
  
  cliente:Cliente={
    _id:'',
    numero_celular:'',
    nome:'',
    complemento:'',
    endereco:'',
    numero:''
  }

  constructor(
    private fb: FormBuilder,
    private clientesService: ClientesService,
    private toastr: ToastrService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.createForm();
    const routeSubscription = this.activatedRoute.params.subscribe(
			(params) => {
				const id = params.id;
				if (id && id.length > 0) {
					const material = this.clientesService
						.read(id)
            .valueChanges();            
					material.subscribe((value) => {
						this.cliente = value;
						this.cliente._id = id;
            this.titulo.next(`Editar - ${this.cliente.nome}`)	;	
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
    this.clienteForm = this.fb.group({
      _id: [this.cliente._id],
      numero_celular: [this.cliente.numero_celular, Validators.required],
      nome: [this.cliente.nome],
      complemento: [this.cliente.complemento],
      endereco: [this.cliente.endereco],
      numero: [this.cliente.numero]
    });
  }

  onSubmit() {
    const controls = this.clienteForm.controls;
    /** check form */
    if (this.clienteForm.invalid) {
      Object.keys(controls).forEach((controlName) =>
        controls[controlName].markAsTouched()
      );
      return;
    }

    const cli: Cliente = this.prepareProduto();

    if (cli._id) {
      this.updateCliente(cli);
      return;
    }

    this.addCliente(cli);
  }

  addCliente(prod: Cliente) {
    this.clientesService.create(prod).then((result) => {
      this.toastr.success("Cliente cadastrado com sucesso", "Atenção!", {
        closeButton: true,
        progressAnimation: "decreasing",
        progressBar: true,
      });
      this.router.navigateByUrl("lista-de-clientes", {
        relativeTo: this.activatedRoute,
      });
    });
  }

  updateCliente(prod: Cliente) {
    this.clientesService.update(prod._id, prod).then((result) => {
      this.toastr.success("Cliente atualizado com sucesso", "Atenção!", {
        closeButton: true,
        progressAnimation: "decreasing",
        progressBar: true,
      });
      this.router.navigateByUrl("lista-de-clientes", {
        relativeTo: this.activatedRoute,
      });
    });
  }

  prepareProduto(): Cliente {
    const controls = this.clienteForm.controls;
    const produto: Cliente = {
      _id: controls._id.value,
      numero_celular: controls.numero_celular.value,
      nome: controls.nome.value,
      complemento: controls.complemento.value,
      endereco: controls.endereco.value,
      numero: controls.numero.value
    };

    return produto;
  }

  voltar(){
    this.router.navigate(["../lista-de-clientes"], {});
  }

}
