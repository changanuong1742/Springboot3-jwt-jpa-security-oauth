import {Component} from '@angular/core';
import {FormBuilder, FormGroup} from "@angular/forms";
import {SeatService} from "../../core/services/seat/seat.service";
import {NgxSpinnerService} from "ngx-spinner";
import {MatDialog} from "@angular/material/dialog";
import {ToastrService} from "ngx-toastr";
import {UserService} from "../../core/services/user/user.service";
import {RouterLink} from "@angular/router";
import {TableComponent} from "../../shared/components/table/table.component";
import {HelperService} from "../../core/services/helper/helper.service";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [RouterLink, TableComponent, MatButton,
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  data!: any;
  formData!: FormGroup;
  displayedColumns: string[] = ['id', 'email'];
  listAction: any = {
    view: true,
    edit: true,
    create: true,
    delete: true,
  };
  nameRoute = "user";

  constructor(private _helperService: HelperService, private _userService: UserService, private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.spinner.show();
    this.getAll();
    this.listAction = this._helperService.checkAccessAction(this.nameRoute);
  }

  getAll() {
    this._userService.onGetAll().subscribe((res: any) => {
      if (res) {
        this.data = res.content;
        this.spinner.hide();
      }
    });
  }

  removeRecord(obj: any) {
    this._userService.onDelete(obj).subscribe((res: any) => {
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
}
