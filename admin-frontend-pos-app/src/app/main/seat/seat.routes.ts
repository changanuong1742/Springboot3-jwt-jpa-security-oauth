import {Routes} from "@angular/router";
import {DataEntryComponent} from "./data-entry/data-entry.component";
import {SeatComponent} from "./seat.component";
import {PermissionGuard} from "../../core/guards/permission.guard";

export const SEAT_ROUTES: Routes = [
  {
    path: '',
    component: SeatComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['View seat'] }
  },
  {
    path: 'create',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['Create seat'] }
  },
  {
    path: 'edit',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['Update seat'] }
  },
  {
    path: 'detail',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['View seat'] }

  }
];
