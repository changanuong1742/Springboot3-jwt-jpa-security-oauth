import {inject} from '@angular/core';
import {Observable} from 'rxjs';
import {ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {CookieService} from 'ngx-cookie-service';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
):
  Observable<boolean | UrlTree>
  | Promise<boolean | UrlTree>
  | boolean
  | UrlTree => {
  return inject(CookieService).get('token')
    ? true
    : inject(Router).createUrlTree(['403']);
};


