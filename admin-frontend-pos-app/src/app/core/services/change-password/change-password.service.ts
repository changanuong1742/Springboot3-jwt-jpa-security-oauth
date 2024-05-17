import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {

  constructor(private _http: HttpClient) {
  }

  changePassword(formData: FormData) {
    return this._http.put(`http://localhost:9898/api/user/change-password`, formData);
  }
}
