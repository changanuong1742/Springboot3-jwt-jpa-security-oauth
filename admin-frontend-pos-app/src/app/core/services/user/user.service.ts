import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private _http: HttpClient) {
  }

  onGetAll() {
    return this._http.get(`http://localhost:9898/api/user`);
  }

  onCreate(formData: FormData) {
    return this._http.post(`http://localhost:9898/api/user`, formData);
  }
  onUpdate(formData: FormData) {
    return this._http.put(`http://localhost:9898/api/user/update`, formData);
  }

  onGet(id: string | null) {
    return this._http.get(`http://localhost:9898/api/user/` + id);
  }

  onDelete(obj: any) {
    return this._http.delete(`http://localhost:9898/api/user/` + obj.id);
  }
}
