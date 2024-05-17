import {Component} from '@angular/core';
import {SeatService} from "../../core/services/seat/seat.service";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {RegexValidate} from "../../core/validators/regex.constants";
import {NgxSpinnerService} from "ngx-spinner";
import {NgForOf, NgIf} from "@angular/common";
import {ToastrService} from "ngx-toastr";
import {RouterLink} from "@angular/router";
import {MatDialog} from "@angular/material/dialog";
import {DialogConfirmComponent} from "../../shared/components/dialog-confirm/dialog-confirm.component";
import {HelperService} from "../../core/services/helper/helper.service";
import {MatButton, MatIconButton} from "@angular/material/button";

@Component({
  selector: 'app-seat',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    ReactiveFormsModule,
    RouterLink,
    MatIconButton,
    MatButton,
  ],
  templateUrl: './seat.component.html',
  styleUrl: './seat.component.scss'
})
export class SeatComponent {
  data!: any;
  formData!: FormGroup;
  listAction: any = {
    view: true,
    edit: true,
    create: true,
    delete: true,
  };
  nameRoute = "seat";

  constructor(private _helperService: HelperService, private _seatService: SeatService, private fb: FormBuilder, private spinner: NgxSpinnerService, public dialog: MatDialog, private toastr: ToastrService) {
    this.spinner.show();
    this.formData = this.fb.group({
      keyword: "",
    });
    this.getAll();
    this.listAction = this._helperService.checkAccessAction(this.nameRoute);
  }

  searchName() {
    this.getAll();
  }

  getAll() {
    this._seatService.onGetAll(this.formData).subscribe(res => {
      if (res) {
        this.data = res;
        this.spinner.hide();
      }
    });
  }

  delete(obj: any) {
    this._seatService.onDelete(obj.id).subscribe((res: any) => {
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

  deleteRecord(obj: any) {
    const dialogRef = this.dialog.open(DialogConfirmComponent, {
      data: {
        message: 'Are you sure want to delete?',
        buttonText: {
          ok: 'Yes',
          cancel: 'No'
        }
      }
    });
    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed) {
        this.delete(obj);
      }
    });
  }
}

