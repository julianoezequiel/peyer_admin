import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: '404.component.html',
  styleUrls: ['404.component.scss']
})
export class P404Component {

  constructor(
    private router: Router
  ) { }

  goToHome() {
    this.router.navigate(["/dashboard"]);
  }

}
