import moment from 'moment';
import { UserFirebase } from './../user/userfirebase.model';

export class DriversHistory {
  uid: string;
  displayName: string;
  updateDate: string;

  constructor(driver: UserFirebase, updateDate: string) {
    this.uid = driver.uid;
    this.displayName = driver.displayName;
    this.updateDate = updateDate;
  }
}
