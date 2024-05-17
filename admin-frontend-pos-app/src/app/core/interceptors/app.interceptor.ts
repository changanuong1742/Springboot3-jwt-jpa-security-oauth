import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import {Injectable} from "@angular/core";
import {BehaviorSubject, catchError, filter, finalize, Observable, switchMap, take, tap, throwError} from "rxjs";
import {CookieService} from "ngx-cookie-service";
import {Router} from "@angular/router";
import {environment} from "../../../../environments/environment";
import {AuthService} from "../services/auth/auth.service";
import {NgxSpinnerService} from "ngx-spinner";
import {log} from "@angular-devkit/build-angular/src/builders/ssr-dev-server";

@Injectable()
export class AppInterceptor implements HttpInterceptor {
  private refreshingInProgress: boolean = false;
  public accessTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private cookieService: CookieService,
    private _authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    return next.handle(this.addAuthorizationHeader(req)).pipe(
      catchError(err => {
        if (err instanceof HttpErrorResponse && this.isTokenRefreshError(err, req)) {
          return this.handleTokenRefresh(req, next);
        }
        return throwError(() => err);
      })
    );
  }

  private isTokenRefreshError(error: HttpErrorResponse, req: HttpRequest<any>): boolean {
    return error.status === 401 || error.status === 403 && !req.url.includes('refresh-token');
  }

  private handleTokenRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshToken = this.cookieService.get('refreshToken');
    if (!this.refreshingInProgress) {
      console.log("chay")
      this.refreshingInProgress = true;
      this.cookieService.set('token', refreshToken, {
        path: "/",
        sameSite: "Strict",
        domain: environment.DOMAIN_COOKIE
      });
      return this._authService.onRefreshToken().pipe(
        tap((res: any) => {
          this.cookieService.set('token', res.access_token, {
            path: "/",
            sameSite: "Strict",
            domain: environment.DOMAIN_COOKIE
          });
          this.cookieService.set('refreshToken', res.refresh_token, {
            path: "/",
            sameSite: "Strict",
            domain: environment.DOMAIN_COOKIE
          });
          this.cookieService.set('userId', res.user_id, {
            path: "/",
            sameSite: "Strict",
            domain: environment.DOMAIN_COOKIE
          });
          this.accessTokenSubject.next(res.access_token);
        }),
        switchMap(() => next.handle(this.addAuthorizationHeader(req))),
        catchError((err) => {
          this.logoutAndRedirect(err);
          return throwError(() => err);
        }),
        finalize(() => {
          this.refreshingInProgress = false;
        })
      );
    }
    else {
      return this.accessTokenSubject.pipe(
        filter((token) => token !== null),
        take(1),
        switchMap(() => next.handle(this.addAuthorizationHeader(req))),
        catchError((err) =>
          throwError(() => err)
        )
      );
    }
  }

  private addAuthorizationHeader(request: HttpRequest<any>,): HttpRequest<any> {
    const accessToken = this.cookieService.get('token');
    if (accessToken) {
      return request.clone({
        setHeaders: {Authorization: `Bearer ${accessToken}`},
      });
    }
    return request;
  }

  private logoutAndRedirect(err: HttpErrorResponse): Observable<HttpEvent<any>> {
    this.cookieService.delete('refreshToken', '/', environment.DOMAIN_COOKIE);
    this.cookieService.delete('token', '/', environment.DOMAIN_COOKIE);
    this.cookieService.delete('userId', '/', environment.DOMAIN_COOKIE);
    this.router.navigate(['403']);
    return throwError(() => err);
  }
}
