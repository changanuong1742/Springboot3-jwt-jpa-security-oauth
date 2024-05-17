import { Component } from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-page-419',
  standalone: true,
  imports: [],
  templateUrl: './page-419.component.html',
  styleUrl: './page-419.component.scss'
})
export class Page419Component {
  constructor(private spinner: NgxSpinnerService) {
    this.spinner.hide();
  }
}
