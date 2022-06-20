import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from '../../../material.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VehicleHistoriesRoutingModule } from './vehicle-history-routing.module';
import { VehicleHistoryComponent } from './vehicle-history.component';
import { DriversHistoryComponent } from './drivers-history/drivers-history.component';
import { RoutesHistoryComponent } from './routes-history/routes-history.component';
import { DamagesHistoryComponent } from './damages-history/damages-history.component';


@NgModule({
  declarations: [VehicleHistoryComponent, DriversHistoryComponent, RoutesHistoryComponent, DamagesHistoryComponent],
  imports: [
    CommonModule,
    VehicleHistoriesRoutingModule,
    MaterialModule,
    TranslateModule
  ],
})
export class VehicleHistoriesModule { }
