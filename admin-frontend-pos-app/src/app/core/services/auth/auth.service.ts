import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private _http: HttpClient) {
  }

  onRefreshToken() {
    return this._http.post(`http://localhost:9898/api/auth/refresh-token`, [])
  }
}
