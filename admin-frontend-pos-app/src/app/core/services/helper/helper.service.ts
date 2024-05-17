import {Injectable} from '@angular/core';
import {CookieService} from "ngx-cookie-service";

@Injectable({
  providedIn: 'root'
})
export class HelperService {

  constructor(private cookieService: CookieService) {
  }

  checkAccessAction(model: any) {
    return {
      view: this.computePermission('View ' + model),
      edit: this.computePermission('Update ' + model),
      create: this.computePermission('Create ' + model),
      delete: this.computePermission('Delete ' + model)
    };
  }

  private computePermission(permission: any) {
    const permissionArray = JSON.parse(this.cookieService.get('permission'));
    // Kiểm tra xem quyền cho hành động cụ thể có tồn tại trong mảng quyền không
    return permissionArray.includes(permission);
  }
}
