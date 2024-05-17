import {Routes} from "@angular/router";
import {DataEntryComponent} from "./data-entry/data-entry.component";
import {UserComponent} from "./user.component";
import {PermissionGuard} from "../../core/guards/permission.guard";

export const USER_ROUTES: Routes = [
  {
    path: '',
    component: UserComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['View user'] }
  },
  {
    path: 'create',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['Create user'] }
  },
  {
    path: 'edit',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['Update user'] }
  },
  {
    path: 'detail',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['View user'] }
  }
];
