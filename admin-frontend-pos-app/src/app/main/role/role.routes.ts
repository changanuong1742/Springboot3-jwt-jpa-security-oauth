import {Routes} from "@angular/router";
import {DataEntryComponent} from "./data-entry/data-entry.component";
import {RoleComponent} from "./role.component";
import {PermissionGuard} from "../../core/guards/permission.guard";

export const ROLE_ROUTES: Routes = [
  {
    path: '',
    component: RoleComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['View role'] }

  },
  {
    path: 'create',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['Create role'] }
  },
  {
    path: 'edit',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['Update role'] }
  },
  {
    path: 'detail',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['View role'] }
  }
];
