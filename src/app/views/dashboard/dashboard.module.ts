import { UsersDialog } from './users-dialog/users-dialog.component';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './../../material.module';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from 'ng2-charts';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { ButtonsModule } from 'ngx-bootstrap/buttons';

import { DashboardComponent } from './dashboard.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { TranslateModule } from '@ngx-translate/core';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { TodaysBirthdaysDialog } from './todays-birthdays-dialog/todays-birthdays-dialog.component';
import { VehiclesDialog } from './vehicles-dialog/vehicles-dialog.component';
import { TodaysRoutesDialog } from './todays-routes-dialog/todays-routes-dialog.component';
import { TodaysNewsDialog } from './todays-news-dialog/todays-news-dialog.component';
import { AbsenceRequestsDialog } from './absence-requests-dialog/absence-requests-dialog.component';
import { ImprovementsDialog } from './improvements-dialog/improvements-dialog.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule,
    ChartsModule,
    BsDropdownModule,
    ButtonsModule.forRoot(),
    TranslateModule,
    MaterialModule,
    PopoverModule.forRoot(),
  ],
  declarations: [ 
    DashboardComponent,
    TodaysBirthdaysDialog,
    UsersDialog,
    VehiclesDialog,
    TodaysRoutesDialog,
    TodaysNewsDialog,
    AbsenceRequestsDialog,
    ImprovementsDialog
  ],
  entryComponents: [
    TodaysBirthdaysDialog,
    UsersDialog,
    VehiclesDialog,
    TodaysRoutesDialog,
    TodaysNewsDialog,
    AbsenceRequestsDialog,
    ImprovementsDialog
  ]
})
export class DashboardModule { }
