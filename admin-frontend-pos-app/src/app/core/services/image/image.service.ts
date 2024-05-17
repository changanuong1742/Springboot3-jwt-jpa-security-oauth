import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor(private _http: HttpClient) { }

  onUpload(formData: FormData) {
    return this._http.post("http://localhost:9898/api/image", formData);
  }
}
