import {Component} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from "@angular/forms";
import {UserService} from "../../../core/services/user/user.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute} from "@angular/router";
import {MatError, MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgForOf, NgIf} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {RoleService} from "../../../core/services/role/role.service";
import {MatOption} from "@angular/material/autocomplete";
import {MatSelect} from "@angular/material/select";
import {MatCheckbox, MatCheckboxChange, MatCheckboxModule} from "@angular/material/checkbox";
import {PermissionService} from "../../../core/services/permission/permission.service";

@Component({
  selector: 'app-data-entry',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatError,
    MatFormField,
    MatInput,
    MatLabel,
    NgIf,
    MatButton,
    MatOption,
    MatSelect,
    NgForOf,
    MatCheckbox,
    MatCheckboxModule, FormsModule
  ],
  templateUrl: './data-entry.component.html',
  styleUrl: './data-entry.component.scss'
})
export class DataEntryComponent {
  protected readonly Object = Object;
  formData!: FormGroup;
  editId!: string | null;
  listAction: any = {
    edit: false,
    view: false,
    create: false
  };

  permissionList: any;

  permissionSelected: any = [];

  constructor(private _roleService: RoleService, private _permissionService: PermissionService, private fb: FormBuilder, private spinner: NgxSpinnerService, private toastr: ToastrService, private route: ActivatedRoute) {
    this.getPermissionAll();
    this.editId = this.route.snapshot.queryParamMap.get("id");
    this.formData = this.fb.group({
      id: [''],
      name: ['', [Validators.required]],
      permission_ids: [],
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

  getDetail() {
    this._roleService.onGet(this.editId).subscribe((res: any) => {
      if (res) {
        this.formData.get('id')?.setValue(res.body.data.id);
        this.formData.get('name')?.setValue(res.body.data.name);
        this.permissionSelected = res.body.data.permission_ids.map(function (value: { id: any; }) {
          return value.id;
        });

      }
    })
  }

  getPermissionAll() {
    this._permissionService.onGetAll().subscribe((res: any) => {
      if (res && res.body) {
        this.permissionList = this.groupPermissions(res.body.data)
        console.log(this.permissionList)
      }
    })
  }

  submit() {
    this.formData.get('permission_ids')?.setValue(this.permissionSelected);
    if (this.editId) {
      this._roleService.onUpdate(this.formData.getRawValue()).subscribe((res: any) => {
        if (res && res.statusCodeValue === 200) {
          this.toastr.success("Update success", "Success");
        } else if (res.body.errors) {
          this.formData.get('name')?.setErrors({'unique': res.body.errors.name});
        } else {
          this.toastr.success("Error", "Fail");
        }
      })
    } else {
      this._roleService.onCreate(this.formData.getRawValue()).subscribe((res: any) => {
        if (res && res.statusCodeValue === 200) {
          this.toastr.success("Create success", "Success");
        } else if (res.body.errors) {
          this.formData.get('name')?.setErrors({'unique': res.body.errors.name});
        } else {
          this.toastr.success("Error", "Fail");
        }
      })
    }
  }

  onCheckboxChangePermission(event: any, id: number) {
    const index = this.permissionSelected.indexOf(id);
    if (index === -1) {
      // If the id is not in the array, add it
      this.permissionSelected.push(id);
    } else {
      // If the id is already in the array, remove it
      this.permissionSelected.splice(index, 1);
    }
  }


  groupPermissions(permissions: { id: number, name: string }[]): { [key: string]: any[] }[] {
    const groupedPermissions: { [key: string]: any[] } = {};

    permissions.forEach(permission => {
      const nameParts = permission.name.split(' ');
      const entity = nameParts.pop()?.toLowerCase();

      if (entity) {
        if (!groupedPermissions[entity]) {
          groupedPermissions[entity] = [];
        }

        groupedPermissions[entity].push({
          id: permission.id,
          name: permission.name,
          entity: entity
        });
      }
    });

    return Object.keys(groupedPermissions).map(entity => ({
      [entity]: groupedPermissions[entity]
    }));
  }
}
