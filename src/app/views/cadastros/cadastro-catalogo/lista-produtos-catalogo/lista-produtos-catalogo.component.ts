import { Component, OnInit, Inject } from "@angular/core";
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from "@angular/material/dialog";
import { Produto } from "../../model/produto.model";
import { ProdutosService } from "../../services/produtos.service";

@Component({
  selector: "app-lista-produtos-catalogo",
  templateUrl: "./lista-produtos-catalogo.component.html",
  styleUrls: ["./lista-produtos-catalogo.component.css"],
})
export class ListaProdutosCatalogoComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ListaProdutosCatalogoComponent>,
    @Inject(MAT_DIALOG_DATA) public listaSelecionada: Produto[],
    public produtosService: ProdutosService
  ) {
    this.isLoading = true;
  }

  listaOriginal: Produto[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.carregarDados();    
  }

  onNoClick(): void {
    this.dialogRef.close(this.listaSelecionada);
  }

  carregarDados() {
    this.isLoading = true;
    
    this.produtosService.listar().then((d:Produto[]) => {

      d.forEach((i:Produto)=>{
        let index = this.listaSelecionada.filter((item:Produto)=>item._id == i._id);
        console.log("index :"+index);
        if(index.length == 0){
          this.listaOriginal.push(i);
        }
      });     
      
      this.isLoading = false;
    });

  }

  addItem(p:Produto){
    this.listaSelecionada.push(p);
    let index = this.listaOriginal.indexOf(p);
    this.listaOriginal.splice(index,1);
  }
}
