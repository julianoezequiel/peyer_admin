import { AngularFireStorage } from "@angular/fire/storage";
import { UserFirebase } from "../../views/pages/model/user/userfirebase.model";
import { ChangeDetectorRef } from "@angular/core";
import { style } from "@angular/animations";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { navItems } from "../../_nav";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";

import { LangChangeEvent, TranslateService } from "@ngx-translate/core";

@Component({
  selector: "app-dashboard",
  templateUrl: "./default-layout.component.html",
  styleUrls: ["./default-layout.component.scss"],
})
export class DefaultLayoutComponent implements OnDestroy, OnInit {
  public sidebarMinimized = false;

  public navItems = navItems.map((items) => {
    this.translate(items);
    return items;
  });

  downloadURL: string = "";
  isDashboard: boolean = false;
  userLocal: UserFirebase;

  constructor(
    private router: Router,
    private ts: TranslateService,
    private changeDetectorRef: ChangeDetectorRef,
    private angularFireStorage: AngularFireStorage
  ) {
    console.log("Init Layout");

    this.router.events.subscribe((r) => {
      if (r instanceof NavigationEnd) {
        this.isDashboard = r.url.includes("dashboard");
      }
    });
  }
  ngOnDestroy(): void {
    //throw new Error('Method not implemented.')
  }

  ngOnInit(): void {
    this.ts.onLangChange.subscribe((event: LangChangeEvent) => {
      this.navItems = navItems.map((items) => {
        this.translate(items);
        return items;
      });
    });

    this.downloadPhoto();
  }

  downloadPhoto() {
    this.userLocal = JSON.parse(
      localStorage.getItem("user_firebase")
    ) as UserFirebase;

    if (this.userLocal.photoURL) {
      this.angularFireStorage
        .ref("/" + this.userLocal.photoURL)
        .getDownloadURL()
        .subscribe((complete) => {
          this.downloadURL = complete;
        });
    }
  }

  ngAfterViewChecked(): void {
    this.changeDetectorRef.detectChanges();
  }

  translate(item): void {
    if ("name" in item) {
      const trans = this.ts.instant(`${item.name}`);
      if (trans !== `${item.name}`) {
        item.name = trans;
      }
    }
    if (item.children && item.children.length > 0) {
      item.children.map((child: any) => this.translate(child));
    }
  }
  toggleMinimize() {
    this.sidebarMinimized = !this.sidebarMinimized;
  }

  logout() {
    localStorage.removeItem("user_firebase");
    this.router.navigate(["/login"]);
  }
}
