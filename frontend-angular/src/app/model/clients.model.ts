import { Product } from '../products/models/product.model';



export interface Client {

  id : string;
  cni : string;
  nom : string;
  prenom : string;
  email : string;
  telephone : string;
  image : string;
 }


export interface  Payment {
  id : number;
  datePaiment : string;
  montant : number ;
  client : Client;
  produit : Product;

}
  export enum PaymentStatus {
    CREATED=0,VALIDATED=1,REJECTED=2
    }
   export enum  PaymentType{
     CASH=0 , CHECK=1 , TRANSFER=2 , DEPOSIT=3
     }







