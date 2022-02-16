import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { Cliente } from '../model/cliente.model';
import { Pedido } from "../model/pedido.model";

@Injectable({
  providedIn: "root",
})
export class ClientesService {
  constructor(private firestore: AngularFirestore) {}

  collectionName = "clientes";

  create(record: Cliente) {
    console.log(record);
    return this.firestore.collection(this.collectionName).add(record);
  }

  update(recordID, record: Cliente) {
    return this.firestore
      .collection(this.collectionName)
      .doc(recordID)
      .update(record);
  }

  read(recordID): AngularFirestoreDocument<Cliente> {
    return this.firestore.collection(this.collectionName).doc(recordID);
  }

  read_all() {
    return this.firestore.collection(this.collectionName).snapshotChanges();
  }

  count() {
    return this.firestore.collection(this.collectionName).valueChanges();
  }

  delete(record_id) {
    return this.firestore
      .collection(this.collectionName)
      .doc(record_id)
      .delete();
  }

  buscarPorNumeroCelular(numero_celular: string): Promise<Cliente[]> {
    return new Promise<Cliente[]>((acept, reject) => {
      var docs = this.firestore
        .collection(this.collectionName)
        .ref.where("cliente.numero_celular", "==", numero_celular);
      let lista: any[] = [];
      docs.get().then(function (d) {
        d.forEach((e) => {
          lista.push(e.data());
        });
        acept(lista);
      });
    });
  }

  buscarNome(pesquisa: string): Promise<Cliente[]> {
    return new Promise<Cliente[]>((acept, reject) => {
      var docs = this.firestore
        .collection(this.collectionName)
        .ref.orderBy("nome")
         .where("nome", ">=", pesquisa)
         .where("nome", "<=", pesquisa + "\uf8ff");
      let lista: any[] = [];
      docs.get().then(function (d) {
        d.forEach((e) => {
          lista.push(e.data());
        });
        acept(lista);
      });
    });
  }

  buscarCelular(pesquisa: string): Promise<Cliente[]> {
    return new Promise<Cliente[]>((acept, reject) => {
      var docs = this.firestore.collection(this.collectionName)
        .ref.orderBy("numero_celular")
         .where("numero_celular", ">=", pesquisa)
         .where("numero_celular", "<=", pesquisa + "\uf8ff");
      let lista: any[] = [];
      docs.get().then(function (d) {
        d.forEach((e) => {
          lista.push(e.data());
        });
        acept(lista);
      });
    });
  }

  listar(): Promise<Cliente[]> {
    return new Promise<Cliente[]>((acept, reject) => {
      this.read_all().subscribe((data) => {
        let lista: Cliente[] = data.map((e) => {
          return {
            _id: e.payload.doc.id,
            nome: e.payload.doc.data()["nome"],
            numero_celular: e.payload.doc.data()["numero_celular"],
            endereco: e.payload.doc.data()["endereco"],
            numero: e.payload.doc.data()["numero"],
            complemento: e.payload.doc.data()["complemento"]
          };
        });
        acept(lista);
      });
    });
  }
}
