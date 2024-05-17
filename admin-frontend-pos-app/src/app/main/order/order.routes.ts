import {Routes} from "@angular/router";
import {DataEntryComponent} from "./data-entry/data-entry.component";
import {OrderComponent} from "./order.component";
import {PermissionGuard} from "../../core/guards/permission.guard";

export const ORDER_ROUTES: Routes = [
  {
    path: '',
    component: OrderComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['View order'] }
  },
  {
    path: 'create',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['Create order'] }
  },
  {
    path: 'edit',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['Update order'] }
  },
  {
    path: 'detail',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['View order'] }
  }
];
