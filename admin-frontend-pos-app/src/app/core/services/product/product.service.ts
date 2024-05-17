import {Injectable} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  constructor(private _http: HttpClient) {
  }

  onGetAll(obj: any) {
    const keyword = obj ? obj.value.keyword : '';
    return this._http.get(`http://localhost:9898/api/product?keyword=${keyword}`);
  }

  onCreate(formData: FormData) {
    return this._http.post("http://localhost:9898/api/product", formData);
  }

  onUpdate(formData: FormData) {
    return this._http.put("http://localhost:9898/api/product", formData);
  }

  onGet(id: string | null) {
    return this._http.get(`http://localhost:9898/api/product/` + id);
  }

  onDelete(obj: any) {
    return this._http.delete(`http://localhost:9898/api/product/` + obj.id);
  }
}
