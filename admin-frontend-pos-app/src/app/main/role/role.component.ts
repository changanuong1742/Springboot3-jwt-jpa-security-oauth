import {Component} from '@angular/core';
import {TableComponent} from "../../shared/components/table/table.component";
import {UserService} from "../../core/services/user/user.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {RoleService} from "../../core/services/role/role.service";
import {RouterLink} from "@angular/router";
import {FormGroup} from "@angular/forms";
import {MatButton} from "@angular/material/button";

@Component({
  selector: 'app-role',
  standalone: true,
  imports: [
    RouterLink, TableComponent, MatButton,
  ],
  templateUrl: './role.component.html',
  styleUrl: './role.component.scss'
})
export class RoleComponent {
  data!: any;
  formData!: FormGroup;
  displayedColumns: string[] = ['id', 'name'];
  listAction: any = {
    view: true,
    edit: true,
    delete: true,
  };
  nameRoute = "role";

  constructor(private _roleService: RoleService, private spinner: NgxSpinnerService, private toastr: ToastrService) {
    this.spinner.show();
    this.getAll();
  }

  getAll() {
    this._roleService.onGetAll().subscribe((res: any) => {
      if (res) {
        this.data = res.content;
        this.spinner.hide();
      }
    });
  }

  removeRecord(obj: any) {
    this._roleService.onDelete(obj).subscribe((res: any) => {
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
