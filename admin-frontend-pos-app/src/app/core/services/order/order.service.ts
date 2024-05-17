import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Stomp} from "@stomp/stompjs";
import SockJS from "sockjs-client";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private stompClient: any;

  constructor(private _http: HttpClient) {
    this.initConnectionSocket();
  }

  onGetAll() {
    return this._http.get(`http://localhost:9898/api/order`);
  }

  onGetAllBySeat(id: string | null) {
    return this._http.get(`http://localhost:9898/api/order/all/seat/` + id);
  }

  onGet(id: string | null) {
    return this._http.get(`http://localhost:9898/api/order/` + id);
  }

  onCreate(obj: any) {
    return this._http.post("http://localhost:9898/api/order", obj);
  }

  onUpdate(formData: FormData) {
    return this._http.put("http://localhost:9898/api/order", formData);
  }

  joinSocket(): Observable<any> {
    return new Observable((observer) => {
      this.stompClient.connect({}, () => {
        this.stompClient.subscribe(`/pos`, (messages: any) => {
          if (messages.body) {
            const messageContent = JSON.parse(messages.body);
            observer.next(messageContent);
          }
        });
      });
    });
  }

  initConnectionSocket() {
    const url = 'http://localhost:9898/chat-socket';
    const socket = new SockJS(url);
    this.stompClient = Stomp.over(socket);
  }

  sendMessage(obj: any) {
    this.stompClient.send(`/app/home`, {}, JSON.stringify(obj))
  }
}
