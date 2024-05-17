import {Component, OnInit} from '@angular/core';
import {HomeService} from "../../core/services/home/home.service";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent{
  constructor(private homeService: HomeService) {
  }
}
