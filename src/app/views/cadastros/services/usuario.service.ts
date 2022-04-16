import { Injectable } from "@angular/core";
import {
  AngularFirestore,
  AngularFirestoreDocument,
} from "@angular/fire/firestore";
import { Produto } from "../model/produto.model";
import { UserFirebase } from '../../login/userfirebase.model';

@Injectable({
  providedIn: "root",
})
export class UsuarioService {
  constructor(private firestore: AngularFirestore) {}

  collectionName = "users";

  create(record: UserFirebase) {
    console.log(record);
    return this.firestore.collection(this.collectionName).add(record);
  }

  update(recordID, record: UserFirebase) {
    return this.firestore
      .collection(this.collectionName)
      .doc(recordID)
      .update(record);
  }

  read(recordID): AngularFirestoreDocument<UserFirebase> {
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

  listar():Promise<UserFirebase[]>{
    return new Promise<UserFirebase[]>((acept,reject)=>{
     this.read_all().subscribe((data)=>{
        let lista:UserFirebase[]= data.map((e)=>{
         return {
           uid: e.payload.doc.id,
           email: e.payload.doc.data()["email"],
           displayName: e.payload.doc.data()["displayName"],
           photoURL: e.payload.doc.data()["photoURL"],
           emailVerified:e.payload.doc.data()["emailVerified"],
           password:'',
           password2:'',
           jobTitle: e.payload.doc.data()["jobTitle"],
           birthDate: e.payload.doc.data()["birthDate"],
           permissions: e.payload.doc.data()["permissions"],
           emergencyContacts: e.payload.doc.data()["emergencyContacts"],
         }
       })
       acept(lista);
     });
    })
   }
}
