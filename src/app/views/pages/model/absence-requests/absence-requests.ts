import moment from "moment";

export class AbsenceRequest {
  _id: string;
  userID: string;
  beginDate: string;
  endDate: string;

  /**
   * @description The period types are:
   *
   * * Morning = 1
   * * Afternoon = 2
   * * wholeDay = 3
   */
  period: PERIOD_TYPE | number | string;

  /**
   * @description The causes types are:
   *
   * * Vacation = 1
   * * Family = 2
   * * Sick/Accident = 3
   * * Military = 4
   * * Other = 5
   */
  cause: CAUSE_TYPE | number | string;

  /**
   * @description The statuses types are:
   *
   * * Pending = 1
   * * Rejected = 2
   * * Accepted = 3
   */
  status: ABSENCE_REQUEST_STATUS | number | string;

  constructor() {
    this.userID = "";
    this.beginDate = moment().format("DD/MM/YYYY");
    this.endDate = moment().format("DD/MM/YYYY");
    this.status = new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.PENDING);
  }
}

// ---------------------
// PERIOD TYPES
// ---------------------
export class PERIOD_TYPE {
  value: PERIOD;

  constructor(status: PERIOD) {
    if (status) {
      this.value = status;
    }
  }

  get label(): string {
    if (this.value == PERIOD.MORNING) {
      return "cadastros.absenceRequests.period.morning";
    } else if (this.value == PERIOD.AFTERNOON) {
      return "cadastros.absenceRequests.period.afternoon";
    } else if (this.value == PERIOD.WHOLE_DAY) {
      return "cadastros.absenceRequests.period.wholeDay";
    }
  }

  getByValue(value) {
    if (value) {
      switch (value) {
        case PERIOD.MORNING:
          return new PERIOD_TYPE(PERIOD.MORNING);
        case PERIOD.AFTERNOON:
          return new PERIOD_TYPE(PERIOD.AFTERNOON);
        case PERIOD.WHOLE_DAY:
          return new PERIOD_TYPE(PERIOD.WHOLE_DAY);
      }
    }
  }
}

export enum PERIOD {
  MORNING = 1,
  AFTERNOON = 2,
  WHOLE_DAY = 3,
}
//------------------\\------------------

// ---------------------
// CAUSE TYPES
// ---------------------
export class CAUSE_TYPE {
  value: CAUSE;

  constructor(type: CAUSE) {
    this.value = type;
  }

  get label(): string {
    if (this.value == CAUSE.VACATION) {
      return "cadastros.absenceRequests.cause.vacation";
    } else if (this.value == CAUSE.FAMILY) {
      return "cadastros.absenceRequests.cause.family";
    } else if (this.value == CAUSE.SICK_ACCIDENT) {
      return "cadastros.absenceRequests.cause.sickAccident";
    } else if (this.value == CAUSE.MILITARY) {
      return "cadastros.absenceRequests.cause.military";
    } else if (this.value == CAUSE.OTHER) {
      return "cadastros.absenceRequests.cause.other";
    }
  }

  getByValue(value) {
    if (value) {
      switch (value) {
        case CAUSE.VACATION:
          return new CAUSE_TYPE(CAUSE.VACATION);
        case CAUSE.FAMILY:
          return new CAUSE_TYPE(CAUSE.FAMILY);
        case CAUSE.SICK_ACCIDENT:
          return new CAUSE_TYPE(CAUSE.SICK_ACCIDENT);
        case CAUSE.MILITARY:
          return new CAUSE_TYPE(CAUSE.MILITARY);
        case CAUSE.OTHER:
          return new CAUSE_TYPE(CAUSE.OTHER);
      }
    }
  }
}

export enum CAUSE {
  VACATION = 1,
  FAMILY = 2,
  SICK_ACCIDENT = 3,
  MILITARY = 4,
  OTHER = 5,
}
//------------------\\------------------

// ---------------------
// REQUEST STATUS
// ---------------------
export class ABSENCE_REQUEST_STATUS {
  value: STATUS_ABSENCE;

  constructor(status: STATUS_ABSENCE) {
    if (status) {
      this.value = status;
    }
  }

  get label(): string {
    if (this.value == STATUS_ABSENCE.PENDING) {
      return "cadastros.absenceRequests.status.pending";
    } else if (this.value == STATUS_ABSENCE.ACCEPTED) {
      return "cadastros.absenceRequests.status.accepted";
    } else if (this.value == STATUS_ABSENCE.REJECTED) {
      return "cadastros.absenceRequests.status.rejected";
    } else if (this.value == STATUS_ABSENCE.ALL) {
      return "cadastros.absenceRequests.status.all";
    }
  }

  getByValue(value) {
    if (value) {
      switch (value) {
        case STATUS_ABSENCE.PENDING:
          return new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.PENDING);
        case STATUS_ABSENCE.ACCEPTED:
          return new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.ACCEPTED);
        case STATUS_ABSENCE.REJECTED:
          return new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.REJECTED);
        case STATUS_ABSENCE.ALL:
          return new ABSENCE_REQUEST_STATUS(STATUS_ABSENCE.ALL);
      }
    }
  }
}

export enum STATUS_ABSENCE {
  PENDING = 1,
  REJECTED = 2,
  ACCEPTED = 3,
  ALL = 4, // For filter
}
//------------------\\------------------
