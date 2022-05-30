import { Injectable } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root",
})
export class ErrorFirebaseService {
  constructor(private translate: TranslateService) {}

  // Returns the error message find by the FireBase 'code'
  // PS. ADD TO THE INTERNATIONALIZATION FILE, THE OTHER IDs AND CORRESPONDING MESSAGES
  getErrorByCode(code: string): string {
    try {
      code = code.split("/")[1];

      if (this.hasTranslation(`errorFirebase.${code}`)) {
        return this.translate.instant(`errorFirebase.${code}`);
      } else {
        return this.translate.instant("errorFirebase.desconhecido", {
          value: code,
        });
      }
    } catch (error) {
      return this.translate.instant("errorFirebase.desconhecido", {
        value: "ER-001",
      });
    }

  }

  hasTranslation(key: string): boolean {
    const translation = this.translate.instant(key);
    return translation !== key && translation !== "";
  }
}
