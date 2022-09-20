import { AbsenceRequestsDialog } from "./absence-requests-dialog/absence-requests-dialog.component";
import { TodaysNewsDialog } from "./todays-news-dialog/todays-news-dialog.component";
import { VehiclesDialog } from "./vehicles-dialog/vehicles-dialog.component";
import { UsersDialog } from "./users-dialog/users-dialog.component";
import {
  AbsenceRequest,
  STATUS_ABSENCE,
} from "./../pages/model/absence-requests/absence-requests";
import { Component, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { Router } from "@angular/router";
import moment from "moment";
import { Subscription } from "rxjs";

import { ImprovementsService } from "../pages/services/improvements.service";
import { UsuarioService } from "../pages/services/usuario.service";
import { VehicleService } from "../pages/services/vehicle.service";
import {
  Improvement,
  STATUS_IMPROVEMENT,
} from "./../pages/model/improvements/improvements";
import { Newsletter } from "./../pages/model/newsletter/newsletter.model";
import { AbsenceRequestsService } from "./../pages/services/absence-requests.service";
import { DailyScheduleService } from "./../pages/services/dailyschedule.service";
import { NewsletterService } from "./../pages/services/newsletter.service";
import { TodaysBirthdaysDialog } from "./todays-birthdays-dialog/todays-birthdays-dialog.component";
import { MatTooltip } from "@angular/material/tooltip";
import { UserFirebase } from "../pages/model/user/userfirebase.model";
import { Vehicle } from "../pages/model/vehicle/vehicle.model";
import { DailySchedule } from "../pages/model/daily-schedule/dailyschedule.model";
import { TodaysRoutesDialog } from "./todays-routes-dialog/todays-routes-dialog.component";
import { ImprovementsDialog } from "./improvements-dialog/improvements-dialog.component";

export class Utils {
  public static unsubscribeAll(subObject: { subscriptions: Subscription[] }) {
    subObject.subscriptions.forEach((subscription) =>
      subscription.unsubscribe()
    );
  }
}

@Component({
  templateUrl: "dashboard.component.html",
  styleUrls: ["dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  // USERS CARD
  users = {
    total: 0,
    active: {
      total: 0,
      list: [] as UserFirebase[],
    },
    inactive: {
      total: 0,
      list: [] as UserFirebase[],
    },
  };

  // VEHICLES CARD
  vehicles = {
    total: 0,
    onRoute: {
      total: 0,
      list: [] as Vehicle[],
    },
    onGarage: {
      total: 0,
      list: [] as Vehicle[],
    },
  };

  // IMPROVEMENTS CARD
  improvements = {
    total: 0,
    pending: {
      total: 0,
      list: [] as Improvement[],
    },
    done: {
      total: 0,
      list: [] as Improvement[],
    },
    rejected: {
      total: 0,
      list: [] as Improvement[],
    },
  };

  // ABSENCE REQUESTS CARD
  absence = {
    total: 0,
    pending: {
      total: 0,
      list: [] as AbsenceRequest[],
    },
    accepted: {
      total: 0,
      list: [] as AbsenceRequest[],
    },
    rejected: {
      total: 0,
      list: [] as AbsenceRequest[],
    },
  };

  // TODAY'S BIRTHDAYS CARD
  todaysBirthdays = {
    total: 0,
    list: [] as UserFirebase[],
  };

  // TODAY'S NEWS CARD
  todaysNews = {
    total: 0,
    list: [] as Newsletter[],
  };

  // TODAY'S ROUTES CARD
  todaysRoutes = {
    total: 0,
    list: [] as DailySchedule[],
  };

  constructor(
    public router: Router,
    private usuarioService: UsuarioService,
    private vehicleService: VehicleService,
    private improvementService: ImprovementsService,
    private absenceRequestsService: AbsenceRequestsService,
    private newsletterService: NewsletterService,
    private dailyScheduleService: DailyScheduleService,
    private dialog: MatDialog
  ) {}

  ngOnDestroy(): void {
    Utils.unsubscribeAll({ subscriptions: this.subscriptions });
    this.dialog.closeAll();
  }

  ngOnInit(): void {
    this.setUsersAndBirthdaysCards();
    this.setVehiclesCard();
    this.setImprovementsCard();
    this.setAbsenceRequestsCard();
    this.setTodaysNewsCard();
    this.setTodaysRoutesCard();
  }

  setUsersAndBirthdaysCards() {
    const usersBirthdaysSub = this.usuarioService
      .count()
      .subscribe((result) => {
        // USERS CARD
        this.users.active.list = [];
        this.users.inactive.list = [];

        this.users.total = result.length;

        this.users.active.total = result.filter((x) => {
          if (x.active) {
            this.users.active.list.push(x);
            return true;
          }
        }).length;

        this.users.inactive.total = result.filter((x) => {
          if (!x.active) {
            this.users.inactive.list.push(x);
            return true;
          }
        }).length;

        // TODAY'S BIRTHDAYS CARD
        this.todaysBirthdays.list = [];

        this.todaysBirthdays.total = result.filter((x) => {
          let birthDate = moment(x.birthDate, ["DD/MM/YYYY"]);
          let now = moment().startOf("day");

          if (
            birthDate.date() == now.date() &&
            birthDate.month() == now.month() &&
            x.active
          ) {
            this.todaysBirthdays.list.push(x);
            return true;
          }
        }).length;
      });

    this.subscriptions.push(usersBirthdaysSub);
  }

  setVehiclesCard() {
    const vehiclesSub = this.vehicleService.count().subscribe((result) => {
      this.vehicles.onRoute.list = [];
      this.vehicles.onGarage.list = [];

      this.vehicles.total = result.length;

      this.vehicles.onRoute.total = result.filter((x) => {
        if (x.onRoute) {
          this.vehicles.onRoute.list.push(x);
          return true;
        }
      }).length;

      this.vehicles.onGarage.total = result.filter((x) => {
        if (!x.onRoute) {
          this.vehicles.onGarage.list.push(x);
          return true;
        }
      }).length;
    });

    this.subscriptions.push(vehiclesSub);
  }

  setImprovementsCard() {
    const improvementsSub = this.improvementService
      .count()
      .subscribe((result: Improvement[]) => {
        this.improvements.pending.list = [];
        this.improvements.done.list = [];
        this.improvements.rejected.list = [];

        this.improvements.total = result.length;

        this.improvements.pending.total = result.filter((x) => {
          if (x.requestStatus == STATUS_IMPROVEMENT.PENDING) {
            this.improvements.pending.list.push(x);
            return true;
          }
        }).length;

        this.improvements.done.total = result.filter((x) => {
          if (x.requestStatus == STATUS_IMPROVEMENT.DONE) {
            this.improvements.done.list.push(x);
            return true;
          }
        }).length;

        this.improvements.rejected.total = result.filter((x) => {
          if (x.requestStatus == STATUS_IMPROVEMENT.REJECTED) {
            this.improvements.rejected.list.push(x);
            return true;
          }
        }).length;
      });

    this.subscriptions.push(improvementsSub);
  }

  setAbsenceRequestsCard() {
    const absenceRequestsSub = this.absenceRequestsService
      .count()
      .subscribe((result: AbsenceRequest[]) => {
        this.absence.pending.list = [];
        this.absence.accepted.list = [];
        this.absence.rejected.list = [];

        this.absence.total = result.length;

        this.absence.pending.total = result.filter((x) => {
          if (x.status == STATUS_ABSENCE.PENDING) {
            this.absence.pending.list.push(x);
            return true;
          }
        }).length;

        this.absence.accepted.total = result.filter((x) => {
          if (x.status == STATUS_ABSENCE.ACCEPTED) {
            this.absence.accepted.list.push(x);
            return true;
          }
        }).length;

        this.absence.rejected.total = result.filter((x) => {
          if (x.status == STATUS_ABSENCE.REJECTED) {
            this.absence.rejected.list.push(x);
            return true;
          }
        }).length;
      });

    this.subscriptions.push(absenceRequestsSub);
  }

  setTodaysNewsCard() {
    const newslettersSub = this.newsletterService
      .count()
      .subscribe((result: Newsletter[]) => {
        this.todaysNews.list = [];

        this.todaysNews.total = result.filter((x) => {
          let publicationDate = moment(x.publicationDate, ["DD/MM/YYYY"]);
          let now = moment().startOf("day");

          if (publicationDate.isSame(now)) {
            this.todaysNews.list.push(x);
            return true;
          }
        }).length;
      });

    this.subscriptions.push(newslettersSub);
  }

  setTodaysRoutesCard() {
    const dailyScheduleSub = this.dailyScheduleService
      .count()
      .subscribe((result) => {
        this.todaysRoutes.list = [];

        this.todaysRoutes.total = result.filter((x) => {
          let beginDate = moment(x.beginDate, ["DD/MM/YYYY"]);
          let now = moment().startOf("day");

          if (beginDate.isSame(now)) {
            this.todaysRoutes.list.push(x);
            return true;
          }
        }).length;
      });

    this.subscriptions.push(dailyScheduleSub);
  }

  // ********************************
  // *** PAGE REDIRECTION METHODS ***
  // ********************************

  goToUsers() {
    this.router.navigate(["users"]);
  }

  goToVehicles() {
    this.router.navigate(["vehicles"]);
  }

  goToDamages() {
    this.router.navigate(["damages"]);
  }

  goToImprovements() {
    this.router.navigate(["improvements"]);
  }

  goToAbsenceRequests() {
    this.router.navigate(["absence-requests"]);
  }

  goToNewsletters() {
    this.router.navigate(["newsletters"]);
  }

  goToDailySchedule() {
    this.router.navigate(["daily-schedule"]);
  }

  // ********************************
  // ***** VIEW DETAILS METHODS *****
  // ********************************

  // TODAY'S BIRTHDAYS DETAILS
  viewTodaysBirthdays() {
    const dialogData = this.todaysBirthdays.list;

    const dialogRef = this.dialog.open(TodaysBirthdaysDialog, {
      width: "400px",
      data: dialogData,
      panelClass: "dialog-details",
    });
  }

  // USERS DETAILS
  viewUsers(status: string) {
    const list =
      status == "active" ? this.users.active.list : this.users.inactive.list;

    const dialogRef = this.dialog.open(UsersDialog, {
      width: "400px",
      data: { list: list, status: status },
      panelClass: "dialog-details",
    });
  }

  // VEHICLES DETAILS
  viewVehicles(status: string) {
    const list =
      status == "onRoute"
        ? this.vehicles.onRoute.list
        : this.vehicles.onGarage.list;

    const dialogRef = this.dialog.open(VehiclesDialog, {
      width: "400px",
      data: { list: list, status: status },
      panelClass: "dialog-details",
    });
  }

  // TODAY'S ROUTES DETAILS
  viewTodaysRoutes() {
    const dialogData = this.todaysRoutes.list;

    const dialogRef = this.dialog.open(TodaysRoutesDialog, {
      width: "400px",
      data: dialogData,
      panelClass: "dialog-details",
    });
  }

  // TODAY'S ROUTES DETAILS
  viewTodaysNews() {
    const dialogData = this.todaysNews.list;

    const dialogRef = this.dialog.open(TodaysNewsDialog, {
      width: "400px",
      data: dialogData,
      panelClass: "dialog-details",
    });
  }

  // ABSENCE REQUESTS DETAILS
  viewAbsenceRequests(status: string) {
    let list = [];
    let subTitle = "";
    let icon = "";

    if (status == "pending") {
      list = this.absence.pending.list;
      subTitle = "cadastros.absenceRequests.status.pending";
      icon = "thumbs_up_down";
    } else if (status == "accepted") {
      list = this.absence.accepted.list;
      subTitle = "cadastros.absenceRequests.status.accepted";
      icon = "thumb_up";
    } else if (status == "rejected") {
      list = this.absence.rejected.list;
      subTitle = "cadastros.absenceRequests.status.rejected";
      icon = "thumb_down";
    }

    const dialogRef = this.dialog.open(AbsenceRequestsDialog, {
      width: "400px",
      data: { list: list, subTitle: subTitle, icon: icon },
      panelClass: "dialog-details",
    });
  }

  // IMPROVEMENTS DETAILS
  viewImprovements(status: string) {
    let list = [];
    let subTitle = "";
    let icon = "";

    if (status == "pending") {
      list = this.improvements.pending.list;
      subTitle = "cadastros.improvements.status.pending";
      icon = "thumbs_up_down";
    } else if (status == "done") {
      list = this.improvements.done.list;
      subTitle = "cadastros.improvements.status.done";
      icon = "thumb_up";
    } else if (status == "rejected") {
      list = this.improvements.rejected.list;
      subTitle = "cadastros.improvements.status.rejected";
      icon = "thumb_down";
    }

    const dialogRef = this.dialog.open(ImprovementsDialog, {
      width: "400px",
      data: { list: list, subTitle: subTitle, icon: icon },
      panelClass: "dialog-details",
    });
  }
}
