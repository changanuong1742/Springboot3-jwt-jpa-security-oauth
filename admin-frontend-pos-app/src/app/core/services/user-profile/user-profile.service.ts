import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  constructor(private _http: HttpClient) {
  }

  updateProfile(formData: FormData) {
    return this._http.put("http://localhost:9898/api/user", formData);
  }

  requestCodeChangeMail(formData : FormData){
    return this._http.post("http://localhost:9898/api/verification-code", formData);
  }
}
