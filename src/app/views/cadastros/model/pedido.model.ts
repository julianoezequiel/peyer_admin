import { FormasPagamentos } from './formas-pagamento.enum';
import { DiaSemana } from './dia-semana.enum';
import { Status } from './status.enum';
import { Produto } from './produto.model';
import { Catalogo } from './catalogo.model';
import { Cliente } from './cliente.model';

export class Pedido {
    data:Date;
    _id:string;
    numero_celular:string;
    produto_pedido:Produto[];
    total_pedido:number;
    status:Status;
    forma_pagamento:FormasPagamentos;
    dia_entrega:DiaSemana;
    pago:boolean | string;
    catalogo:Catalogo;
    cliente:Cliente;
}
