import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmergencyContactsDialog } from './emergency-contacts-dialog.component';

describe('EmergencyContactsDialog', () => {
  let component: EmergencyContactsDialog;
  let fixture: ComponentFixture<EmergencyContactsDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmergencyContactsDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmergencyContactsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
