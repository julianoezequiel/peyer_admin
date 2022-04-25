import { style } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core'
import { navItems } from '../../_nav'
import { Router } from '@angular/router'

import { LangChangeEvent, TranslateService } from '@ngx-translate/core'

@Component({
  selector: 'app-dashboard',
  templateUrl: './default-layout.component.html',
  styleUrls: ['./default-layout.component.scss']
})
export class DefaultLayoutComponent implements OnDestroy, OnInit {
  
  public sidebarMinimized = false
  public navItems = navItems.map(items => {
    this.translate(items)
    return items
  })

  constructor (private router: Router, private ts: TranslateService) {
    console.log('inicializando layout')
  }
  ngOnDestroy (): void {
    throw new Error('Method not implemented.')
  }

  ngOnInit (): void {
    this.ts.onLangChange.subscribe((event: LangChangeEvent) => {
      this.navItems = navItems.map(items => {
        this.translate(items)
        return items
      })
    })
  }

  translate (item): void {
    if ('name' in item) {
      const trans = this.ts.instant(`${item.name}`)
      if (trans !== `${item.name}`) {
        item.name = trans
      }
    }
    if (item.children && item.children.length > 0) {
      item.children.map((child: any) => this.translate(child))
    }
  }
  toggleMinimize (e) {
    this.sidebarMinimized = e
  }

  logout () {
    localStorage.removeItem('user')
    this.router.navigate(['login'])
  }
}
