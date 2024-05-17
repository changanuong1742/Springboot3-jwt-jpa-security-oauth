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
import {Router, RouterLink, RouterOutlet} from "@angular/router";
import {AuthService} from "../../../core/services/auth/auth.service";
import {HttpClient} from "@angular/common/http";
import {SidebarService} from "../../../core/services/sidebar/sidebar.service";
import {CookieService} from "ngx-cookie-service";
import {tap} from "rxjs";
import {MatMenu, MatMenuItem, MatMenuModule} from "@angular/material/menu";
import {environment} from "../../../../../environments/environment";
import {AppService} from "../../../core/services/app/app.service";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    MatDrawerContainer,
    MatFormField,
    MatSelect,
    MatOption,
    MatButton, MatIconModule,
    MatSidenavModule, MatFormFieldModule, MatSelectModule, MatButtonModule, MatToolbar, MatIcon, MatListItem, MatList, MatDivider, RouterLink, RouterOutlet, MatMenu, MatMenuItem, MatButtonModule, MatMenuModule, NgIf
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit {
  isDesktop: boolean | undefined;
  permissions: any = [];
  isAdmin: boolean = false;
  isLogin: boolean = false;
  loading: boolean = true;

  constructor(private breakpointObserver: BreakpointObserver, private _sidebarService: SidebarService, private cookieService: CookieService, private _authService: AuthService, private router: Router, private _appService: AppService) {
    this.getUser();
  }

  ngOnInit() {
    this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet, Breakpoints.Web]).subscribe(result => {
      this.isDesktop = window.innerWidth >= 1024;
    });

    this._appService.getAuthUserSubject().subscribe((data: any) => {
      this.isAdmin = this.permissions.length > 0;
      this.isLogin = true;
      this.loading = false;
      console.log(this.permissions.length)
    });
  }

  getUser() {
    this.loading = true; // Trước khi lấy dữ liệu, đặt trạng thái loading là true
    let logged = this.cookieService.get("userId");
    if (logged) {
      this._appService.onGetUser(logged).subscribe((res: any) => {
        if (res && res.body.data.roles) {
          res.body.data.roles.forEach((role: any) => {
            role.permission_ids.forEach((p: any) => {
              this.permissions.push(p.name);
            });
          });
        }
        this.isAdmin = this.permissions.length > 0;
        this.isLogin = true;
        this.loading = false;
      });
    }
  }

  logout() {
    this.cookieService.delete('refreshToken', '/', environment.DOMAIN_COOKIE);
    this.cookieService.delete('token', '/', environment.DOMAIN_COOKIE);
    this.cookieService.delete('userId', '/', environment.DOMAIN_COOKIE);
    this.router.navigate(['login']);
  }

  protected readonly environment = environment;
}
