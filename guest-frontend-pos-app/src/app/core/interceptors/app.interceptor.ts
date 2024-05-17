import {
  HttpClient,
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
import {AuthService} from "../services/auth/auth.service";
import {environment} from "../../../../environments/environment";
import {Router} from "@angular/router";

@Injectable()
export class AppInterceptor implements HttpInterceptor {
  private refreshingInProgress: boolean = false;
  public accessTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  constructor(
    private cookieService: CookieService,
    private _authService: AuthService,
    private router: Router) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    //withCredentials: true, //not needed anymore
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
    return error.status === 401 || error.status === 403 && !req.url.includes('refreshToken') || !req.url.includes('authenticate');
  }

  private handleTokenRefresh(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const refreshToken = this.cookieService.get('refreshToken');
    if (!this.refreshingInProgress) {
      this.refreshingInProgress = true;
      this.cookieService.set('token', refreshToken, {
        path: "/",
        sameSite: "Strict",
        domain: environment.DOMAIN_COOKIE
      });
      return this._authService.onRefreshToken().pipe(
        tap((res: any) => {
          this.cookieService.set('token', res.body.data.access_token, {
            path: "/",
            sameSite: "Strict",
            domain: environment.DOMAIN_COOKIE
          });
          this.cookieService.set('refreshToken', res.body.data.refresh_token, {
            path: "/",
            sameSite: "Strict",
            domain: environment.DOMAIN_COOKIE
          });
          this.cookieService.set('userId', res.body.data.user_id, {
            path: "/",
            sameSite: "Strict",
            domain: environment.DOMAIN_COOKIE
          });
          this.accessTokenSubject.next(res.body.data.access_token);
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
    } else {
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

    // this.spinnerService.hide("sp3");
    this.cookieService.delete('refreshToken', '/', environment.DOMAIN_COOKIE);
    this.cookieService.delete('token', '/', environment.DOMAIN_COOKIE);
    this.cookieService.delete('userId', '/', environment.DOMAIN_COOKIE);
    this.cookieService.delete('permission', '/', environment.DOMAIN_COOKIE);
    this.router.navigate(['/']);
    return throwError(() => err);
  }
}
