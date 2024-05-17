import {Component, OnInit} from '@angular/core';
import {MatDrawerContainer} from "@angular/material/sidenav";
import {MatFormField, MatFormFieldModule} from "@angular/material/form-field";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbar} from "@angular/material/toolbar";
import {MatIcon, MatIconModule} from "@angular/material/icon";
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {MatList, MatListItem} from "@angular/material/list";
import {MatDivider} from "@angular/material/divider";
import {ActivatedRoute, ParamMap, Router, RouterLink, RouterOutlet} from "@angular/router";
import {CookieService} from "ngx-cookie-service";
import {AuthService} from "../../../core/services/auth/auth.service";
import {environment} from "../../../../../environments/environment";
import {NgForOf, NgIf} from "@angular/common";
import {SidebarService} from "../../../core/services/sidebar/sidebar.service";
import {NgxSpinnerService} from "ngx-spinner";
import {AppService} from "../../../core/services/app/app.service";
import {AppComponent} from "../../../app.component";
import {MatMenu, MatMenuItem, MatMenuModule} from "@angular/material/menu";
import {MatBadge} from "@angular/material/badge";
import {OrderService} from "../../../core/services/order/order.service";
import {switchMap} from "rxjs";
import {NotificationService} from "../../../core/services/notification/notification.service";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatDrawerContainer,
    MatFormField,
    MatSelect,
    MatOption,
    MatButton, MatButtonModule,
    MatMenuModule, MatIconModule,
    MatSidenavModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatToolbar, MatIcon, MatListItem, MatList, MatDivider, RouterLink, RouterOutlet, NgIf, MatMenu, MatMenuItem, MatBadge, NgForOf
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isDesktop: boolean | undefined;

  userInfo!: any;
  notification: any;

  constructor(private _notificationService: NotificationService, private _orderService: OrderService, private appComponent: AppComponent, private breakpointObserver: BreakpointObserver, private cookieService: CookieService, private _appService: AppService, private route: ActivatedRoute) {
    this.appComponent.getUser();
    this._appService.getAuthUserSubject().subscribe(data => {
      if (data) {
        this.userInfo = data;
      }
    });
  }

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      if (result.matches) {
        this.isDesktop = window.innerWidth >= 1024;
      }
    });

    this._orderService.joinSocket().subscribe((messageContent: any) => {
      this.notification = messageContent.body.content;
      console.log(messageContent)
    });

    this._notificationService.onGetAll().subscribe((res: any) => {
      if (res) {
        this.notification = res.content;
      }
    });
  }

  logout() {
    this.cookieService.delete('refreshToken', '/', environment.DOMAIN_COOKIE);
    this.cookieService.delete('token', '/', environment.DOMAIN_COOKIE);
    this.cookieService.delete('userId', '/', environment.DOMAIN_COOKIE);
    this.cookieService.delete('permission', '/', environment.DOMAIN_COOKIE);
    window.location.href = environment.FRONTEND_URL;
  }

  canAccess(value: string) {
    if (this.cookieService.get('permission') && JSON.parse(this.cookieService.get('permission')).length) {
      return JSON.parse(this.cookieService.get('permission')).includes(value);
    } else {
      return false
    }
  }

  protected readonly environment = environment;
}
