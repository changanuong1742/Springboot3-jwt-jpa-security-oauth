import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  constructor(private _http: HttpClient) { }

  onGetAll() {
    return this._http.get(`http://localhost:9898/api/permission`);
  }

}
