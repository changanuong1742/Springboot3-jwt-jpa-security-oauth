import {Component, OnInit} from '@angular/core';
import {ProductService} from "../../core/services/product/product.service";
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {NgxSpinnerService} from "ngx-spinner";
import {MatDialog} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {OrderService} from "../../core/services/order/order.service";
import {TableComponent} from "../../shared/components/table/table.component";
import {RouterLink} from "@angular/router";
import {SeatService} from "../../core/services/seat/seat.service";
import {HelperService} from "../../core/services/helper/helper.service";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-order',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    TableComponent,
    MatButton
  ],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent {
  data!: any;
  formData!: FormGroup;
  displayedColumns: string[] = ['id', 'status'];

  listAction: any = {
    view: true,
    edit: true,
    create: true,
    delete: true,
  };
  nameRoute = "order";

  constructor(private _helperService: HelperService, private _orderService: OrderService, private fb: FormBuilder, private spinner: NgxSpinnerService, public dialog: MatDialog, private toastr: ToastrService) {
    this.spinner.show();
    this.formData = this.fb.group({});
    this.getAll();
    this.listAction = this._helperService.checkAccessAction(this.nameRoute);
  }

  getAll() {
    this._orderService.onGetAll().subscribe((res: any) => {
      if (res.content) {
        this.data = res.content;
      }
      this.spinner.hide();
    });
  }

  removeRecord(obj: any) {
  }
}
