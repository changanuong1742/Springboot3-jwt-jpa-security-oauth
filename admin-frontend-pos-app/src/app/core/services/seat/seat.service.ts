import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {FormGroup} from "@angular/forms";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class SeatService {

  constructor(private _http: HttpClient) {
  }

  onGetAll(obj: any) {
    const keyword = obj ? obj.value.keyword : '';
    return this._http.get(`http://localhost:9898/api/seat?keyword=${keyword}`);
  }

  onCreate(obj: any) {
    return this._http.post("http://localhost:9898/api/seat", obj);
  }

  onUpdate(obj: any) {
    return this._http.put(`http://localhost:9898/api/seat`, obj);
  }

  onGet(id: string | null) {
    return this._http.get(`http://localhost:9898/api/seat/` + id);
  }

  onDelete(id: string | null) {
    return this._http.delete(`http://localhost:9898/api/seat/` + id);
  }
}
