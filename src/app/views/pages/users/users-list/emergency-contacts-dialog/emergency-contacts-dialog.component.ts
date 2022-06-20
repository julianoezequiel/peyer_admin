import { EmergencyContacts } from '../../../model/user/emergencyContacts.model';
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-emergency-contacts-dialog',
  templateUrl: './emergency-contacts-dialog.component.html',
  styleUrls: ['./emergency-contacts-dialog.component.scss']
})
export class EmergencyContactsDialog implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<EmergencyContactsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: {username: string, emergencyContacts: EmergencyContacts}
    ) { }

  ngOnInit(): void {
  }

}
