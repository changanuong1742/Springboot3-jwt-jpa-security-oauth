import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from "rxjs";
import {IInfoUserAuth, User} from "../../models/auth";

@Injectable({
  providedIn: 'root'
})
export class AppService {
  private _authUserSubject: BehaviorSubject<IInfoUserAuth | null> = new BehaviorSubject<IInfoUserAuth | null>(null);

  getAuthUserSubject() {
    return this._authUserSubject;
  }

  setAuthUserSubject(obj: any) {
    const user: IInfoUserAuth = new User();
    user.id = obj.user_id;
    user.firstName = obj.firstname;
    user.lastName = obj.lastname;
    user.email = obj.email;
    user.avatar = obj.avatar;
    let permissionList: any = [];
    if (obj && obj.roles) {
      obj.roles.forEach((role: any) => {
        role.permission_ids.forEach((p: any) => {
          permissionList.push(p.name);
        });
      });
    }
    user.permissions = permissionList;
    this._authUserSubject.next(user);
  }

  constructor(private _http: HttpClient) {
  }

  onGetUser(id: string) {
    return this._http.get(`http://localhost:9898/api/user/${id}`);
  }
}
