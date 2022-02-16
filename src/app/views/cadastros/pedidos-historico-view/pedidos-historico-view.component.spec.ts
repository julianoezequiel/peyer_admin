import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PedidosHistoricoViewComponent } from './pedidos-historico-view.component';

describe('PedidosHistoricoViewComponent', () => {
  let component: PedidosHistoricoViewComponent;
  let fixture: ComponentFixture<PedidosHistoricoViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PedidosHistoricoViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PedidosHistoricoViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
