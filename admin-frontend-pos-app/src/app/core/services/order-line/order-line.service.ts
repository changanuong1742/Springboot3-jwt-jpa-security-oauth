import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class OrderLineService {

  constructor(private _http: HttpClient) {
  }

  onCreate(obj: any) {
    return this._http.post("http://localhost:9898/api/order-line", obj);
  }
}
