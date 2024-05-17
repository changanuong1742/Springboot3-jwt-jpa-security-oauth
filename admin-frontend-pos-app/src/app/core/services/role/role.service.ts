import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  constructor(private _http: HttpClient) { }

  onGetAll() {
    return this._http.get(`http://localhost:9898/api/role`);
  }

  onDelete(obj: any) {
    return this._http.delete(`http://localhost:9898/api/role/` + obj.id);
  }

  onGet(id: string | null) {
    return this._http.get(`http://localhost:9898/api/role/` + id);
  }

  onCreate(formData: FormData) {
    return this._http.post(`http://localhost:9898/api/role`, formData);
  }
  onUpdate(formData: FormData) {
    return this._http.put(`http://localhost:9898/api/role`, formData);
  }
}
