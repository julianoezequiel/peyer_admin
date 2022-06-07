import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root",
})
export class ErrorFirebaseService {
  constructor(private translate: TranslateService) {}

  // Returns the error message find by the FireBase 'code'
  // PS. ADD TO THE INTERNATIONALIZATION FILE, THE OTHER IDs AND CORRESPONDING MESSAGES
  getErrorByCode(error): string {
    try {
      var msg = error.message
      var code = error.code.split("/")[1];
      
      if (this.hasTranslation(`errorFirebase.${code}`)) {
        return this.translate.instant(`errorFirebase.${code}`);
      } else {
        return this.translate.instant("errorFirebase.desconhecido", {
          code: code,
          message: msg
        });
      }
    } catch (error) {
      return this.translate.instant("errorFirebase.desconhecido", {
        code: "SYS-001",
        message: msg
      });
    }

  }

  hasTranslation(key: string): boolean {
    const translation = this.translate.instant(key);
    return translation !== key && translation !== "";
  }
}
