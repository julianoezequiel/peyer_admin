import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaProdutosCatalogoComponent } from './lista-produtos-catalogo.component';

describe('ListaProdutosCatalogoComponent', () => {
  let component: ListaProdutosCatalogoComponent;
  let fixture: ComponentFixture<ListaProdutosCatalogoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaProdutosCatalogoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaProdutosCatalogoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
