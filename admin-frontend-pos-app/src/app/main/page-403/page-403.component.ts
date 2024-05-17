import { Component } from '@angular/core';
import {NgxSpinnerService} from "ngx-spinner";

@Component({
  selector: 'app-page-403',
  standalone: true,
  imports: [],
  templateUrl: './page-403.component.html',
  styleUrl: './page-403.component.scss'
})
export class Page403Component {
  constructor(private spinner: NgxSpinnerService) {
    this.spinner.hide();
  }

}
