import {ApplicationConfig, importProvidersFrom} from '@angular/core';
import {provideRouter, withViewTransitions} from '@angular/router';

import {routes} from './app.routes';
import {provideAnimationsAsync} from '@angular/platform-browser/animations/async';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi} from "@angular/common/http";
import {authInterceptor} from "./core/interceptors/auth.interceptor";
import {AppInterceptor} from "./core/interceptors/app.interceptor";
import {provideClientHydration} from "@angular/platform-browser";
import {provideAnimations} from "@angular/platform-browser/animations";
import {spinnerInterceptor} from "./core/interceptors/spinner.interceptor";
import {provideToastr} from "ngx-toastr";

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes), provideClientHydration(),
    provideAnimations(),
    provideToastr(),
    provideRouter(routes, withViewTransitions()), provideHttpClient(
      withInterceptorsFromDi()
      , withInterceptors(
        [
          spinnerInterceptor,
          authInterceptor
        ]
      )
    ), {
      provide: HTTP_INTERCEPTORS,
      useClass: AppInterceptor,
      multi: true
    }]
};
