import {Component} from '@angular/core';
import {ProductService} from "../../core/services/product/product.service";
import {FormBuilder, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SeatService} from "../../core/services/seat/seat.service";
import {NgxSpinnerService} from "ngx-spinner";
import {MatDialog} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {TableComponent} from "../../shared/components/table/table.component";
import {RouterLink} from "@angular/router";
import {HelperService} from "../../core/services/helper/helper.service";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [
    TableComponent,
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatButton
  ],
  templateUrl: './product.component.html',
  styleUrl: './product.component.scss'
})

export class ProductComponent {
  data!: any;
  formData!: FormGroup;
  displayedColumns: string[] = ['id', 'name'];

  listAction: any = {
    view: true,
    edit: true,
    create: true,
    delete: true,
  };
  nameRoute = "product";

  constructor(private _helperService: HelperService, private _productService: ProductService, private fb: FormBuilder, private spinner: NgxSpinnerService, public dialog: MatDialog, private toastr: ToastrService) {
    this.spinner.show();
    this.formData = this.fb.group({
      keyword: "",
    });
    this.getAll();
    this.listAction = this._helperService.checkAccessAction(this.nameRoute);
  }

  getAll() {
    this._productService.onGetAll(this.formData).subscribe((res: any) => {
      if (res.content) {
        this.data = res.content;
      }
      this.spinner.hide();
    });
  }

  removeRecord(obj: any) {
    this._productService.onDelete(obj).subscribe((res: any) => {
      if (res && res.statusCodeValue === 200) {
        this.getAll();
        this.toastr.success("Deleted success", "Success");
      } else if (res.body.message) {
        this.toastr.success(res.body.message, "Fail");
      } else {
        this.toastr.success("Error", "Fail");
      }
    });
  }

  searchName() {
    this.getAll();
  }

}
