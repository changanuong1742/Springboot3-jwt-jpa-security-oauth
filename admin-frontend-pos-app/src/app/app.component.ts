import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, NavigationEnd, Router, RouterOutlet} from '@angular/router';
import {NgxSpinnerModule, NgxSpinnerService} from "ngx-spinner";
import {CommonModule} from "@angular/common";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import {SidebarService} from "./core/services/sidebar/sidebar.service";
import {CookieService} from "ngx-cookie-service";
import {AppService} from "./core/services/app/app.service";
import {AuthService} from "./core/services/auth/auth.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NgxSpinnerModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent{
  title = 'admin-frontend-pos-app';
  constructor(private spinnerService: NgxSpinnerService, private cookieService: CookieService, private _appService: AppService) {
    this.spinnerService.show();
  }

  getUser() {
    let logged = this.cookieService.get("userId");
    if (logged) {
      this._appService.onGetUser(logged).subscribe((res: any) => {
        this._appService.setAuthUserSubject(res.body.data);
      });
    }
    this.spinnerService.hide();
  }
}
