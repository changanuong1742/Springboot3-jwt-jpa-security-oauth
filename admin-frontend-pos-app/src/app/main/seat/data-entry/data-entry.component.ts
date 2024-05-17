import {Component} from '@angular/core';
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {SeatService} from "../../../core/services/seat/seat.service";
import {NgxSpinnerService} from "ngx-spinner";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatInputModule} from "@angular/material/input";
import {NgForOf, NgIf} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MatIcon} from "@angular/material/icon";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {TableComponent} from "../../../shared/components/table/table.component";
import {OrderService} from "../../../core/services/order/order.service";

@Component({
  selector: 'app-data-entry',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule, MatSelectModule, MatIcon, MatButton, FormsModule, ReactiveFormsModule, NgIf, TableComponent, NgForOf, RouterLink,
  ],
  templateUrl: './data-entry.component.html',
  styleUrl: './data-entry.component.scss'
})
export class DataEntryComponent {
  formData!: FormGroup;
  errors: any;
  editId!: string | null;
  changed: boolean = false;
  listAction: any = {
    edit: false,
    view: false,
    create: false
  };
  orders: any;

  constructor(private _orderService: OrderService, private _seatService: SeatService, private fb: FormBuilder, private spinner: NgxSpinnerService, private toastr: ToastrService, private route: ActivatedRoute) {
    this.editId = this.route.snapshot.queryParamMap.get("id");
    this.spinner.show();
    this.formData = this.fb.group({
      id: [''],
      name: ['', [Validators.required]]
    });

    if (this.editId) {
      this.getDetail();
      this.getAllOrderInSeat();

      if (this.route.snapshot.routeConfig?.path === 'edit') {
        this.listAction.edit = true;
      } else if (this.route.snapshot.routeConfig?.path === 'detail') {
        this.listAction.view = true;
      }
    } else {
      this.listAction.create = true;
    }
    this.spinner.hide();
  }

  submit() {
    if (this.formData.valid) {
      if (this.listAction.edit) {
        this.update();
      } else {
        this.create();
      }
    }
  }

  getDetail() {
    this._seatService.onGet(this.editId).subscribe((res: any) => {
      if (res) {
        this.formData.get('id')?.setValue(res.body.id);
        this.formData.get('name')?.setValue(res.body.name);
      }
    })
  }

  update() {
    this._seatService.onUpdate(this.formData.getRawValue()).subscribe((res: any) => {
      if (res && res.statusCodeValue === 200) {
        this.toastr.success("Update success", "Success");
      } else if (res.body.errors) {
        this.errors = res.body.errors;
        this.formData.get('name')?.setErrors({'unique': this.errors.name});
      } else {
        this.toastr.success("Error", "Fail");
      }
    })
  }

  create() {
    this._seatService.onCreate(this.formData.getRawValue()).subscribe((res: any) => {
      if (res && res.statusCodeValue === 200) {
        this.toastr.success("Create success", "Success");
      } else if (res.body.errors) {
        this.errors = res.body.errors;
        this.formData.get('name')?.setErrors({'unique': this.errors.name});
      } else {
        this.toastr.success("Error", "Fail");
      }
    });
  }

  getAllOrderInSeat() {
    this._orderService.onGetAllBySeat(this.editId).subscribe((res: any) => {
      if (res) {
        this.orders = res;
      }
    });
  }

  formatTime(date: string) {
    const originalDate = new Date(date);

    const day = originalDate.getDate().toString().padStart(2, '0');
    const month = (originalDate.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    const year = originalDate.getFullYear();
    const hours = originalDate.getHours().toString().padStart(2, '0');
    const minutes = originalDate.getMinutes().toString().padStart(2, '0');

    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }
}
