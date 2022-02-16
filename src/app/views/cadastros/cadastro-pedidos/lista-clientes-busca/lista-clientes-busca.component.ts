import { Component, OnInit, Inject } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { Cliente } from "../../model/cliente.model";
import { Produto } from "../../model/produto.model";
import { ClientesService } from "../../services/clientes.service";

@Component({
  selector: "app-lista-clientes-busca",
  templateUrl: "./lista-clientes-busca.component.html",
  styleUrls: ["./lista-clientes-busca.component.css"],
})
export class ListaClientesBuscaComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ListaClientesBuscaComponent>,
    @Inject(MAT_DIALOG_DATA) public clienteSelecionado: Cliente,
    public clientesService: ClientesService,
    private fb: FormBuilder
  ) {
    this.isLoading = true;
    this.pesquisa = "";
    this.isNome = true;
  }

  isNome:boolean;
  listaOriginal: Cliente[] = [];
  isLoading = true;
  form: FormGroup;
  pesquisa: string;

  ngOnInit(): void {
    this.createForm();
  }

  onNoClick(): void {
    this.dialogRef.close(this.clienteSelecionado);
  }

  buscar() {
    const controls = this.form.controls;
    let busca : string = controls.nome.value;
    this.isLoading = true;

    if (this.isNome) {
      this.clientesService.buscarNome(busca).then((d: Cliente[]) => {
        this.listaOriginal = d;
        this.isLoading = false;
      });
    } else {
      if(busca && busca.length>=2){
        let v = busca.slice(0,2);
        if(v != '55'){
          busca = '55'+ busca;
        }
      }
      this.clientesService.buscarCelular(busca).then((d: Cliente[]) => {
        this.listaOriginal = d;
        this.isLoading = false;
      });
    }
  }

  addItem(p: Cliente) {
    this.clienteSelecionado = p;
    this.onNoClick();
  }

  createForm() {
    this.form = this.fb.group({
      nome: [this.pesquisa],
      ctrTipo:[this.isNome]
    });
  }

  changeTipoNome(){
    this.isNome = true;
  }

  changeTipoCel(){
    this.isNome = false;
  }

}
