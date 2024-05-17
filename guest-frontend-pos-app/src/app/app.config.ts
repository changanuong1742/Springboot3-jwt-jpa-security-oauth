import {ApplicationConfig} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi} from "@angular/common/http";
import {authInterceptor} from "./core/interceptors/auth.interceptor";
import {AppInterceptor} from "./core/interceptors/app.interceptor";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideAnimationsAsync(), provideHttpClient(
    withInterceptorsFromDi()
    , withInterceptors(
      [
        authInterceptor
      ]
    )
  ), {provide: HTTP_INTERCEPTORS, useClass: AppInterceptor, multi: true}]
};
