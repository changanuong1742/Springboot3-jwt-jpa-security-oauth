import {Routes} from "@angular/router";
import {DashboardComponent} from "./dashboard/dashboard.component";
import {LayoutDashboardComponent} from "../layouts/layout-dashboard/layout-dashboard.component";
import {UserProfileComponent} from "./user-profile/user-profile.component";
import {authGuard} from "../core/guards/auth.guard";
import {Page403Component} from "./page-403/page-403.component";
import {Page419Component} from "./page-419/page-419.component";
import {PermissionGuard} from "../core/guards/permission.guard";

export const Main_Router: Routes = [
  {
    path: '',
    redirectTo: 'admin/dashboard',
    pathMatch: 'full',
  },
  {
    path: '403',
    component: Page403Component
  },
  {
    path: '419',
    component: Page419Component
  },
  {
    path: '',
    component: LayoutDashboardComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'admin/dashboard',
        component: DashboardComponent,
        canActivate: [PermissionGuard],
        data: { roles: ['View seat'] }
      },
      {
        path: 'admin/profile',
        component: UserProfileComponent,
      },
      {
        path: 'admin/seat',
        loadChildren: () =>
          import('./seat/seat.routes')
            .then(m => m.SEAT_ROUTES)
      },
      {
        path: 'admin/product',
        loadChildren: () =>
          import('./product/product.routes')
            .then(m => m.PRODUCT_ROUTES)
      },
      {
        path: 'admin/order',
        loadChildren: () =>
          import('./order/order.routes')
            .then(m => m.ORDER_ROUTES)
      },
      {
        path: 'admin/user',
        loadChildren: () =>
          import('./user/user.routes')
            .then(m => m.USER_ROUTES)
      },
      {
        path: 'admin/role',
        loadChildren: () =>
          import('./role/role.routes')
            .then(m => m.ROLE_ROUTES)
      },
    ]
  },

];
