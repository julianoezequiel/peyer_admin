import moment from "moment";

export class Improvement {
  _id: string;
  userID: string;
  description: string;
  creationDate: string;
  /**
   * @description Request statuses are:
   *
   * * Pending = 1
   * * Rejected = 2
   * * Done = 3
   */
  requestStatus: REQUEST_STATUS | number | string;
  /**
   * @description The request types are:
   *
   * * Client reclamation = 1
   * * Purchase suggestion = 2
   * * Suggestion for improvement = 3
   */
  requestType: REQUEST_TYPE | number | string;

  constructor() {
    this.userID = "";
    this.description = "";
    this.creationDate = moment().format("DD/MM/YYYY");
    this.requestStatus = new REQUEST_STATUS(STATUS_IMPROVEMENT.PENDING);
  }
}

// ---------------------
// REQUEST STATUS
// ---------------------
export class REQUEST_STATUS {
  value: STATUS_IMPROVEMENT;

  constructor(status: STATUS_IMPROVEMENT) {
    if (status) {
      this.value = status;
    }
  }

  get label(): string {
    if (this.value == STATUS_IMPROVEMENT.PENDING) {
      return "cadastros.improvements.status.pending";
    } else if (this.value == STATUS_IMPROVEMENT.DONE) {
      return "cadastros.improvements.status.done";
    } else if (this.value == STATUS_IMPROVEMENT.REJECTED) {
      return "cadastros.improvements.status.rejected";
    } else if (this.value == STATUS_IMPROVEMENT.ALL) {
      return "cadastros.improvements.status.all";
    }
  }

  getByValue(value) {
    if (value) {
      switch (value) {
        case STATUS_IMPROVEMENT.PENDING:
          return new REQUEST_STATUS(STATUS_IMPROVEMENT.PENDING);
        case STATUS_IMPROVEMENT.DONE:
          return new REQUEST_STATUS(STATUS_IMPROVEMENT.DONE);
        case STATUS_IMPROVEMENT.REJECTED:
          return new REQUEST_STATUS(STATUS_IMPROVEMENT.REJECTED);
        case STATUS_IMPROVEMENT.ALL:
          return new REQUEST_STATUS(STATUS_IMPROVEMENT.ALL);
      }
    }
  }
}

export enum STATUS_IMPROVEMENT {
  PENDING = 1,
  REJECTED = 2,
  DONE = 3,
  ALL = 4, // For filter
}
//------------------\\------------------

// ---------------------
// REQUEST TYPES
// ---------------------
export class REQUEST_TYPE {
  value: TYPES_IMPROVEMENT;

  constructor(type: TYPES_IMPROVEMENT) {
    this.value = type;
  }

  get label(): string {
    if (this.value == TYPES_IMPROVEMENT.CLIENT_RECLAMATION) {
      return "cadastros.improvements.requestType.clientReclamation";
    } else if (this.value == TYPES_IMPROVEMENT.PURCHASE_SUGGESTION) {
      return "cadastros.improvements.requestType.purchaseSuggestion";
    } else if (this.value == TYPES_IMPROVEMENT.SUGGESTION_IMPROVEMENTS) {
      return "cadastros.improvements.requestType.suggestionImprovement";
    } else if (this.value == TYPES_IMPROVEMENT.ALL) {
      return "cadastros.improvements.requestType.all";
    }
  }

  getByValue(value) {
    if (value) {
      switch (value) {
        case TYPES_IMPROVEMENT.CLIENT_RECLAMATION:
          return new REQUEST_TYPE(TYPES_IMPROVEMENT.CLIENT_RECLAMATION);
        case TYPES_IMPROVEMENT.PURCHASE_SUGGESTION:
          return new REQUEST_TYPE(TYPES_IMPROVEMENT.PURCHASE_SUGGESTION);
        case TYPES_IMPROVEMENT.SUGGESTION_IMPROVEMENTS:
          return new REQUEST_TYPE(TYPES_IMPROVEMENT.SUGGESTION_IMPROVEMENTS);
        case TYPES_IMPROVEMENT.ALL:
          return new REQUEST_TYPE(TYPES_IMPROVEMENT.ALL);
      }
    }
  }
}

export enum TYPES_IMPROVEMENT {
  CLIENT_RECLAMATION = 1,
  PURCHASE_SUGGESTION = 2,
  SUGGESTION_IMPROVEMENTS = 3,
  ALL = 4, // For filter
}
//------------------\\------------------
