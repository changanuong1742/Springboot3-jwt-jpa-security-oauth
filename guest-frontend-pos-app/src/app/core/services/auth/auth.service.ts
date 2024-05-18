import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {CookieService} from 'ngx-cookie-service';
import {environment} from "../../../../../environments/environment";
import {BehaviorSubject, map, Observable} from "rxjs";
import {IInfoUserAuth, User} from "../../models/auth";
import {SidebarService} from "../sidebar/sidebar.service";
import {Router} from "@angular/router";
import {AppService} from "../app/app.service";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _errorMessageSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  getErrorMessage(): Observable<string | null> {
    return this._errorMessageSubject;
  }

  setErrorMessage(message: string | null) {
    this._errorMessageSubject.next(message);
  }

  constructor(private _http: HttpClient, private cookieService: CookieService, private _sidebarService: SidebarService, private router: Router, private _appService: AppService) {
  }

  onLogin(obj: any) {
    return this._http.post("http://localhost:9898/api/auth/authenticate", obj).subscribe((res: any) => {
      const user: IInfoUserAuth = new User();
      if (res && res.body.errors === null) {
        const dataBody = res.body;
        user.id = dataBody.data.user_id;
        user.token = dataBody.data.access_token;
        user.refreshToken = dataBody.data.refresh_token;
        this.cookieService.set('token', dataBody.data.access_token, {
          path: "/",
          sameSite: "Strict",
          domain: environment.DOMAIN_COOKIE
        });
        this.cookieService.set('refreshToken', dataBody.data.refresh_token, {
          path: "/",
          sameSite: "Strict",
          domain: environment.DOMAIN_COOKIE
        });
        this.cookieService.set('userId', dataBody.data.user_id, {
          path: "/",
          sameSite: "Strict",
          domain: environment.DOMAIN_COOKIE
        });
        let logged = this.cookieService.get("userId");
        if (logged) {
          this._appService.onGetUser(logged).subscribe((res: any) => {
            this._appService.setAuthUserSubject(res);
          });
        }
        this.setErrorMessage(null);
        window.location.href = "/";
      } else {
        this.setErrorMessage(res.error);
        this.cookieService.delete('refreshToken', '/', environment.DOMAIN_COOKIE);
        this.cookieService.delete('token', '/', environment.DOMAIN_COOKIE);
        this.cookieService.delete('userId', '/', environment.DOMAIN_COOKIE);
        this.cookieService.delete('permission', '/', environment.DOMAIN_COOKIE);
        this._appService.setAuthUserSubject(null)
      }
    });
  }

  onLoginSocial(obj: any) {
    const user: IInfoUserAuth = new User();
    user.id = obj.user_id;
    user.token = obj.access_token;
    user.refreshToken = obj.refresh_token;
    this.cookieService.set('token', obj.access_token, {
      path: "/",
      sameSite: "Strict",
      domain: environment.DOMAIN_COOKIE
    });
    this.cookieService.set('refreshToken', obj.refresh_token, {
      path: "/",
      sameSite: "Strict",
      domain: environment.DOMAIN_COOKIE
    });
    this.cookieService.set('userId', obj.user_id, {
      path: "/",
      sameSite: "Strict",
      domain: environment.DOMAIN_COOKIE
    });

    let logged = this.cookieService.get("userId");
    if (logged) {
      this._appService.onGetUser(logged).subscribe((res: any) => {
        this._appService.setAuthUserSubject(res);
      });
    }
    this.setErrorMessage(null);
    this.router.navigate(['/']);
  }

  onRefreshToken() {
    return this._http.post(`http://localhost:9898/api/auth/refresh-token`, [])
  }

  getToken(code: string) {
    return this._http.get("http://localhost:9898/api/google/callback?code=" + code);
  }

  get(url: string): any {
    return this._http.get("http://localhost:9898" + url);
  }

  getUrlGoogleLogin() {
    return this._http.get("http://localhost:9898/api/google/get-url-auth");
  }
}
