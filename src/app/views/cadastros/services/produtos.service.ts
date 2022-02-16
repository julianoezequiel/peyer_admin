import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { Produto } from "../model/produto.model";

@Injectable({
  providedIn: "root",
})
export class ProdutosService {
  constructor(private firestore: AngularFirestore) {}

  collectionName = "produtos";

  create(record: Produto) {
    console.log(record);
    return this.firestore.collection(this.collectionName).add(record);
  }

  update(recordID, record: Produto) {
    return this.firestore
      .collection(this.collectionName)
      .doc(recordID)
      .update(record);
  }

  read(recordID): AngularFirestoreDocument<Produto> {
    return this.firestore.collection(this.collectionName).doc(recordID);
  }

  read_all() {
    return this.firestore.collection(this.collectionName).snapshotChanges();
  }

  count() {
    return this.firestore.collection(this.collectionName).valueChanges();
  }


  delete(record_id) {
    return this.firestore.collection(this.collectionName).doc(record_id).delete();
  }

  listar():Promise<Produto[]>{
    return new Promise<Produto[]>((acept,reject)=>{
     this.read_all().subscribe((data)=>{
        let lista:Produto[]= data.map((e)=>{
         return {
           _id: e.payload.doc.id,
           descricao: e.payload.doc.data()["descricao"],
           limite: e.payload.doc.data()["limite"],
           observacao: e.payload.doc.data()["observacao"],
           unidade_medida:e.payload.doc.data()["unidade_medida"],
           valorA:e.payload.doc.data()["valorA"],
           valorB:e.payload.doc.data()["valorB"],
           quantidade:0,
           valor_total:0,
           index:e.payload.doc.data()["index"],
           cod_fornecedor:e.payload.doc.data()["cod_fornecedor"],
         }
       })
       acept(lista);
     });
    })
   }
}
