import moment from 'moment';
import { UserFirebase } from './../user/userfirebase.model';

export class DriversHistory {
  uid: string;
  displayName: string;
  updateDate: string;

  constructor(driver: UserFirebase) {
    this.uid = driver.uid;
    this.displayName = driver.displayName;
    this.updateDate = moment(new Date()).format("DD/MM/YYYY HH:mm");
  }
}
