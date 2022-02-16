import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PaginaSucessoComponent } from './pagina-sucesso.component';

describe('PaginaSucessoComponent', () => {
  let component: PaginaSucessoComponent;
  let fixture: ComponentFixture<PaginaSucessoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PaginaSucessoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PaginaSucessoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
