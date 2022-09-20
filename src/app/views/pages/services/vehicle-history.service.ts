import { UsuarioService } from './usuario.service';
import { VehicleService } from './vehicle.service';
import { Observable } from 'rxjs';
import { Moment } from 'moment';
import { DailySchedule } from './../model/daily-schedule/dailyschedule.model';
import { ToastrService } from "ngx-toastr";
import { UserFirebase } from "./../model/user/userfirebase.model";
import { DriversRouteHistory } from "./../model/vehicle-history/drivers-history.model";
import { Vehicle } from "./../model/vehicle/vehicle.model";
import { TranslateService } from "@ngx-translate/core";
import { ErrorFirebaseService } from "./../../error/services/error-firebase.service";
import { AngularFirestore } from "@angular/fire/firestore";
import { Injectable } from "@angular/core";
import moment from 'moment';

@Injectable({
  providedIn: "root",
})
export class VehicleHistoryService {
  constructor(
    private firestore: AngularFirestore,
    private userService: UsuarioService
  ) {}

  collection = this.firestore.collection<DailySchedule>("daily-schedules");

  // Get driver and route histories
  getHistoryDriversRoute(vehicleID: string) {
    return new Promise<DriversRouteHistory[]>(async (resolve) => {

      let pico = await this.collection.ref.where("vehicleID", "==", vehicleID) // (this.collectionName, (ref) => ref.where("email", "==", email))
      .get().then(async (x) => {
        let routes = x.docs
          .map(x => x.data())
          .sort((v1, v2) => {
            
          let time1 = `${v1.beginTime.substring(0, 2)}:${v1.beginTime.substring(2)}`;
          let time2 = `${v2.beginTime.substring(0, 2)}:${v2.beginTime.substring(2)}`;
  
          let d1: Moment = moment(`${v1.beginDate} ${time1}`, ["DD/MM/YYYY HH:mm"]);
          let d2: Moment = moment(`${v2.beginDate} ${time2}`, ["DD/MM/YYYY HH:mm"]);
      
          return moment(d2).diff(d1);
        })

        let histories: DriversRouteHistory[] = [];
        
        for (const ds of routes) {
          await this.userService.getById(ds.driverID).get().toPromise()
          .then((driver) => {
            let history = new DriversRouteHistory();
            
            //DD/MM/YYY HH:MM
            history.date = `${ds.beginDate} ${ds.beginTime.substring(0, 2)}:${ds.beginTime.substring(2)}`

            //DD/MM/YYY
            // history.date = ds.beginDate;
            
            history.displayName = driver.data().displayName;
            history.from = ds.departure;
            history.to = ds.destination;

            histories.push(history);
          });
        }

        resolve(histories);
      });
    });
  }

}
