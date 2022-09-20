export interface DailySchedule {
  _id: string;
  driverID: string;
  vehicleID: string;
  departure: string;
  destination: string;
  beginDate: string;
  beginTime: string;
  completed: boolean;
};
