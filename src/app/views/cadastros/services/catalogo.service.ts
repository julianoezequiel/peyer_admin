import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { Produto } from "../model/produto.model";
import { Catalogo } from "../model/catalogo.model";
import { sanitizeIdentifier } from "@angular/compiler";
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: "root",
})
export class CatalogoService {
  constructor(private firestore: AngularFirestore) {
    this.datePipe = new DatePipe("pt-BR");
    this.formato = "dd/MM/yyyy";
  }

  collectionName = "catalogo";
  datePipe: DatePipe; 
  formato: string;

  create(record: Catalogo) {
    console.log(record);
    return this.firestore.collection(this.collectionName).add(record);
  }

  update(recordID, record: Catalogo) {
    return this.firestore
      .collection(this.collectionName)
      .doc(recordID)
      .update(record);
  }

  read(recordID): AngularFirestoreDocument {
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

  buscarAtual(): Promise<Catalogo[]> {
    return new Promise<Catalogo[]>((acept, reject) => {
      let lista: Catalogo[] = [];
      this.firestore
        .collection(this.collectionName)
        .ref.where("atual", "==", true)
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            let c: Catalogo = {
              _id: doc.id,
              produtos: doc.data()["produtos"],
              data_entrega: doc.data()["data_entrega"],
              data_string:'',
              dia_confirmar: doc.data()["dia_confirmar"],
              hora_confirmar: doc.data()["hora_confirmar"],
              hora_inicio_entrega: doc.data()["hora_inicio_entrega"],
              atual: doc.data()["atual"],
              pedidos: doc.data()["pedidos"],
              numero_wpp:doc.data()["numero_wpp"],
            };
            lista.push(c);
          });
          acept(lista);
        })
        .catch(() => {
          reject();
        });
    });
  }

  listar(): Promise<Catalogo[]> {
    return new Promise<Catalogo[]>((acept, reject) => {
      this.read_all().subscribe((data) => {
        let lista: Catalogo[] = data.map((e) => {
          return {
            _id: e.payload.doc.id,
            produtos: e.payload.doc.data()["produtos"],
            data_entrega: e.payload.doc.data()["data_entrega"],
            data_string: this.datePipe.transform(e.payload.doc.data()["data_entrega"].toDate(),this.formato),
            dia_confirmar: e.payload.doc.data()["dia_confirmar"],
            hora_confirmar: e.payload.doc.data()["hora_confirmar"],
            hora_inicio_entrega: e.payload.doc.data()["hora_inicio_entrega"],
            atual: e.payload.doc.data()["atual"],
            pedidos: e.payload.doc.data()["pedidos"],
            numero_wpp:e.payload.doc.data()["numero_wpp"],
          };
        });
        acept(lista);
      });
    });
  }
}
