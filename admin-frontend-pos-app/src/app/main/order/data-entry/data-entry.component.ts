import {Component, Inject, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute, NavigationExtras, ParamMap, Router} from "@angular/router";
import {OrderService} from "../../../core/services/order/order.service";
import {MatFormField, MatInput, MatInputModule} from "@angular/material/input";
import {MatOption, MatSelect, MatSelectModule} from "@angular/material/select";
import {MatFormFieldModule} from "@angular/material/form-field";
import {SeatService} from "../../../core/services/seat/seat.service";
import {NgForOf, NgIf} from "@angular/common";
import {MatButton, MatButtonModule} from "@angular/material/button";
import {ProductService} from "../../../core/services/product/product.service";
import {MatIcon} from "@angular/material/icon";
import {CKEditorModule} from "@ckeditor/ckeditor5-angular";
import {
  MAT_DIALOG_DATA, MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {SelectProductDialogComponent} from "./select-product-dialog/select-product-dialog.component";
import {Subject} from "rxjs";
import {NgxPrintModule} from "ngx-print";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-data-entry',
  standalone: true,
  imports: [NgxPrintModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatIcon, MatButton, FormsModule, ReactiveFormsModule, NgIf, NgForOf, CKEditorModule],

  templateUrl: './data-entry.component.html',
  styleUrl: './data-entry.component.scss'
})
export class DataEntryComponent implements OnInit {
  formData!: FormGroup;
  errors: any;
  editId!: string | null;
  listAction: any = {
    edit: false,
    view: false,
    create: false
  }
  seats!: any;
  products!: any;
  orderLines: any = [];
  totalInvoice: number = 0;

  private idChangeSubject: Subject<string | null> = new Subject<string | null>();

  constructor(private router: Router, private _orderService: OrderService, private _productService: ProductService, private _seatService: SeatService, private fb: FormBuilder, private spinner: NgxSpinnerService, private toastr: ToastrService, private route: ActivatedRoute, public dialog: MatDialog) {

    this.route.queryParamMap.subscribe((params: ParamMap) => {
      this.editId = params.get('id');
      // Gửi id mới đến Subject để thông báo cho component
      this.idChangeSubject.next(this.editId);
      this.orderLines = [];
    });

    this.getSeatAll();
    this.getProductAll();

    this.editId = this.route.snapshot.queryParamMap.get("id");
    this.formData = this.fb.group({
      id: [null],
      seat_id: ['', [Validators.required]],
      order_lines: [],
      status: ['PENDING'],
      payment_status: ['HOLD']
    });

    if (this.editId) {
      this.getDetail();
      if (this.route.snapshot.routeConfig?.path === 'edit') {
        this.listAction.edit = true;
      } else if (this.route.snapshot.routeConfig?.path === 'detail') {
        this.listAction.view = true;
      }
    } else {
      this.listAction.create = true;
    }
  }

  ngOnInit() {
    this.idChangeSubject.subscribe((id: string | null) => {
      // Gọi hàm getDetail() và fetchOrderDetails() khi id thay đổi
      this.getDetail();
    });
  }

  getDetail() {
    this._orderService.onGet(this.editId).subscribe((res: any) => {
      if (res) {
        this.formData.get('seat_id')?.setValue(res.body.data.seat_id);
        this.formData.get('status')?.setValue(res.body.data.status);
        this.formData.get('payment_status')?.setValue(res.body.data.payment_status);
        res.body.data.order_lines.forEach((item: {
          quantity: any;
          product: {
            id: any,
            images: any,
            price: any,
            name: any
          }
        }) => {
          this.orderLines.push(
            {
              id: item.product.id,
              name: item.product.name,
              image: item.product.images && item.product.images.length ?  item.product.images[0].fileName : './assets/images/product-found.jpg',
              quantity: item.quantity,
              price: item.product.price
            }
          )
        })

      }
    })
  }

  removeProduct(index: number) {
    this.orderLines.splice(index, 1);
  }


  getSeatAll() {
    this._seatService.onGetAll(null).subscribe((res: any) => {
      if (res.content) {
        this.seats = res.content;
      }
      this.spinner.hide();
    });
  }

  getProductAll() {
    this._productService.onGetAll(null).subscribe((res: any) => {
      if (res.content) {
        this.products = res.content;
        this.computeTotalInvoice();
      }
      this.spinner.hide();
    });
  }

  submit() {
    if (this.editId) {
      let data: any = [];
      this.orderLines.forEach((obj: { id: any; quantity: any; }) => {
        data.push({
          product_id: obj.id,
          order_id: this.editId,
          quantity: obj.quantity
        })
      })
      this.formData.get('order_lines')?.setValue(data);
      this.formData.get('id')?.setValue(this.editId);
      this._orderService.onUpdate(this.formData.getRawValue()).subscribe((res: any) => {
        if (res && res.statusCodeValue === 200) {
          this.toastr.success("Update success", "Success");
        } else {
          this.toastr.success("Error", "Fail");
        }
        this.spinner.hide();
      });
    } else {
      console.log(this.formData.getRawValue())
      this._orderService.onCreate(this.formData.getRawValue()).subscribe((res: any) => {
        if (res && res.statusCodeValue === 200) {
          this.toastr.success("Create success", "Success");
          const orderId = res.body.data.new_order;
          const queryParams: NavigationExtras = {
            queryParams: {
              id: orderId
            }
          };
          this.router.navigate(['/admin/order/edit'], queryParams);
        } else {
          this.toastr.success("Error", "Fail");
        }
        this.spinner.hide();
      });
    }
    this._orderService.sendMessage(null);
  }


  openDialog(): void {
    const dialogRef = this.dialog.open(SelectProductDialogComponent, {
      width: '50vw',
      maxWidth: '50vw',
      data: this.products,
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result)
      // this.animal = result;
      this.addOrderLine(result);
    });
  }

  addOrderLine(data: any) {
    // Kiểm tra xem sản phẩm đã tồn tại trong orderLines hay chưa
    const existingOrderLineIndex = this.orderLines.findIndex((line: {
      id: any;
    }) => line.id === data.id);

    if (existingOrderLineIndex !== -1) {
      // Nếu sản phẩm đã tồn tại, chỉ cộng thêm quantity
      this.orderLines[existingOrderLineIndex].quantity += Number(data.quantity);
    } else {
      // Nếu sản phẩm chưa tồn tại, thêm order line mới
      this.orderLines.push(data);
    }
    this.computeTotalInvoice();
  }

  setStatus(value: string) {
    this.formData.get('status')?.setValue(value);
  }

  setPaymentStatus(value: string) {
    this.formData.get('payment_status')?.setValue(value);
  }

  computeTotalInvoice(){
    this.orderLines.forEach(((item: { price: number; quantity: number; }) => {
      this.totalInvoice = this.totalInvoice + (item.price * item.quantity);
    }))
  }
}
