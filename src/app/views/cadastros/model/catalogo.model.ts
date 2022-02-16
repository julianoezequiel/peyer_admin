import { Produto } from "./produto.model";
import { DiaSemana } from "./dia-semana.enum";
import { Pedido } from './pedido.model';

export interface Catalogo {
  _id: string;

  data_entrega: Date;

  data_string:string;

  dia_confirmar: DiaSemana;
  hora_confirmar: string;

  hora_inicio_entrega: string;

  produtos: Produto[];

  pedidos:Pedido[];

  atual:boolean;

  numero_wpp:string;
}
