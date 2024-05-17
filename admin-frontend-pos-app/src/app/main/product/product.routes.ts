import {Routes} from "@angular/router";
import {DataEntryComponent} from "./data-entry/data-entry.component";
import {ProductComponent} from "./product.component";
import {PermissionGuard} from "../../core/guards/permission.guard";

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    component: ProductComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['View product'] }
  },
  {
    path: 'create',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['Create product'] }
  },
  {
    path: 'edit',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['Update product'] }
  },
  {
    path: 'detail',
    component: DataEntryComponent,
    canActivate: [PermissionGuard],
    data: { roles: ['View product'] }
  }
];
