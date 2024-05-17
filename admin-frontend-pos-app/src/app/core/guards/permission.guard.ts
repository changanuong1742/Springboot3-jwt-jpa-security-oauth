import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {AppService} from '../services/app/app.service';
import {lastValueFrom} from 'rxjs';
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  permissions: string[] = [];

  constructor(
    private _appService: AppService,
    private router: Router,
    private cookieService: CookieService
  ) {
  }

  async getUser(): Promise<void> {
    const logged = this.cookieService.get('userId');

    if (logged && !this.cookieService.get('permission')) {
      const res: any = await lastValueFrom(this._appService.onGetUser(logged));
      if (res && res.body.data.roles) {
        res.body.data.roles.forEach((role: any) => {
          role.permission_ids.forEach((p: any) => {
            this.permissions.push(p.name);
          });
        });
        this.cookieService.set('permission', JSON.stringify(this.permissions), {
          path: "/",
          sameSite: "Strict",
          domain: environment.DOMAIN_COOKIE
        });
      }
    }
  }

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    await this.getUser();
    const routeRoles = route.data['roles'] as Array<string>;
    if (!JSON.parse(this.cookieService.get('permission')).some((permission: string) => routeRoles.includes(permission))) {
      this.router.navigate(["419"]); // Redirect to login if not authorized
      return false;
    }

    return true;
  }
}
