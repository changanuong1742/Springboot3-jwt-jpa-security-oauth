import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(private _http: HttpClient) {}

  onGetAll() {
    return this._http.get(`http://localhost:9898/api/notification`);
  }
}
