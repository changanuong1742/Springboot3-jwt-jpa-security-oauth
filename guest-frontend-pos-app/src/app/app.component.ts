import {Component} from '@angular/core';
import {ActivatedRoute, Router, RouterOutlet} from '@angular/router';
import {CommonModule} from "@angular/common";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {AuthService} from "./core/services/auth/auth.service";
import {CookieService} from "ngx-cookie-service";
import {SidebarService} from "./core/services/sidebar/sidebar.service";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, HttpClientModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'guest-frontend-pos-app';

  constructor(private route: ActivatedRoute, private authService: AuthService, private _authService: AuthService) {
  }

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
          if (params["code"] !== undefined) {
            this.authService.getToken(params["code"]).subscribe((result: any) => {
              if (result) {
                this._authService.onLoginSocial(result);
              }
            });
          }
        }
      );
  }
}
