import {Routes} from "@angular/router";
import {LayoutGuestComponent} from "../layouts/layout-guest/layout-guest.component";
import {HomeComponent} from "./home/home.component";
import {LoginComponent} from "../layouts/auth/login/login.component";

export const Main_Router: Routes = [
  // {
  //   path: '',
  //   redirectTo: '/home',
  //   pahMatch: 'full',
  // },
  {
    path: '',
    component: LayoutGuestComponent,
    children: [
      {
        path: 'home',
        component: HomeComponent,
      }, {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: '**',
        component: HomeComponent,
      },
    ]
  },
];
