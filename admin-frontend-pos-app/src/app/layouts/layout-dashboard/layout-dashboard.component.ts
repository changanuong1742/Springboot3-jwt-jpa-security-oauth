import { Component } from '@angular/core';
import {SidebarComponent} from "./sidebar/sidebar.component";
import {CookieService} from "ngx-cookie-service";
import {environment} from "../../../../environments/environment";

@Component({
  selector: 'app-layout-dashboard',
  standalone: true,
  imports: [
    SidebarComponent
  ],
  templateUrl: './layout-dashboard.component.html',
  styleUrl: './layout-dashboard.component.scss'
})
export class LayoutDashboardComponent {}
