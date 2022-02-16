import { DataSource } from '@angular/cdk/collections';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { map } from 'rxjs/operators';
import { Observable, of as observableOf, merge } from 'rxjs';
import { CatalogoService } from '../services/catalogo.service';
import { Catalogo } from '../model/catalogo.model';

export class ListaCatalogoDataSource extends DataSource<Catalogo> {
  data: Catalogo[] = [];
  paginator: MatPaginator;
  sort: MatSort;

  constructor(public catalogoService:CatalogoService) {
    super();   
  }

  carregarDados():Promise<Catalogo[]>{
   return new Promise<Catalogo[]>((acept,reject)=>{
    this.catalogoService.read_all().subscribe((data)=>{
      this.data = data.map((e)=>{
        return {
            _id: e.payload.doc.id,
            produtos: e.payload.doc.data()["produtos"],
            data_entrega: e.payload.doc.data()["data_entrega"],
            dia_confirmar: e.payload.doc.data()["dia_confirmar"],
            data_string:e.payload.doc.data()["data_entrega"],
            hora_confirmar: e.payload.doc.data()["hora_confirmar"],
            hora_inicio_entrega: e.payload.doc.data()["hora_inicio_entrega"],
            atual:e.payload.doc.data()["atual"],
            pedidos:e.payload.doc.data()["pedidos"],
            numero_wpp:''
        }
      })
      acept(this.data);
    });
   })
  }

  /**
   * Connect this data source to the table. The table will only update when
   * the returned stream emits new items.
   * @returns A stream of the items to be rendered.
   */
  connect(): Observable<Catalogo[]> {
    // Combine everything that affects the rendered data into one update
    // stream for the data-table to consume.
    const dataMutations = [
      observableOf(this.data),
      this.paginator.page,
      this.sort.sortChange
    ];

    return merge(...dataMutations).pipe(map(() => {
      return this.getPagedData(this.getSortedData([...this.data]));
    }));
  }

  /**
   *  Called when the table is being destroyed. Use this function, to clean up
   * any open connections or free any held resources that were set up during connect.
   */
  disconnect() {}

  /**
   * Paginate the data (client-side). If you're using server-side pagination,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getPagedData(data: Catalogo[]) {
    const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
    return data.splice(startIndex, this.paginator.pageSize);
  }

  /**
   * Sort the data (client-side). If you're using server-side sorting,
   * this would be replaced by requesting the appropriate data from the server.
   */
  private getSortedData(data: Catalogo[]) {
    if (!this.sort.active || this.sort.direction === '') {
      return data;
    }

    return data.sort((a, b) => {
      const isAsc = this.sort.direction === 'asc';
      switch (this.sort.active) {
        case 'name': return compareDate(a.data_entrega, b.data_entrega, isAsc);
        case 'id': return compare(+a._id, +b._id, isAsc);
        default: return 0;
      }
    });
  }
}

function compare(a: string | number, b: string | number, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}

function compareDate(a: Date, b: Date, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
