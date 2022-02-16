// Angular
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
// RxJS
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';


@Injectable()
export class AuthGuard implements CanActivate {
    constructor( private router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
        let user = localStorage.getItem('user');
        if(user != null && user != 'null'){
            return true;
        }else{
            this.router.navigateByUrl('/login');
        }        
    }
}
