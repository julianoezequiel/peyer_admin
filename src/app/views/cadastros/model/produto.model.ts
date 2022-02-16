import { UnidadeMedida } from './unidade-medida';

export interface Produto{
    _id:string;
    descricao:string;
    observacao:string;
    unidade_medida:UnidadeMedida;
    valorA:number;
    valorB:number;
    limite:number;
    quantidade:number;
    valor_total:number;
    index:number;
    cod_fornecedor:string;
}