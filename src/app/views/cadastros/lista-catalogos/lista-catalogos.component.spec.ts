import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaCatalogosComponent } from './lista-catalogos.component';

describe('ListaCatalogosComponent', () => {
  let component: ListaCatalogosComponent;
  let fixture: ComponentFixture<ListaCatalogosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ListaCatalogosComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ListaCatalogosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
