import {Component} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {NgForOf, NgIf} from "@angular/common";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {ActivatedRoute} from "@angular/router";
import {MatInputModule} from '@angular/material/input';
import {MatIcon} from "@angular/material/icon";
import {MatOption, MatSelect} from "@angular/material/select";
import {UserService} from "../../../core/services/user/user.service";
import {RegexValidate} from "../../../core/validators/regex.constants";
import {TableComponent} from "../../../shared/components/table/table.component";
import {UploadThumbnailComponent} from "../../../shared/components/upload-thumbnail/upload-thumbnail.component";
import {RoleService} from "../../../core/services/role/role.service";
import {environment} from "../../../../../environments/environment";

@Component({
  selector: 'app-data-entry',
  standalone: true,
  imports: [
    MatButton,
    ReactiveFormsModule,
    MatLabel,
    MatFormField,
    MatInput,
    NgIf,
    MatInputModule,
    MatIconButton,
    MatIcon,
    MatSelect,
    MatOption,
    NgForOf,
    TableComponent,
    UploadThumbnailComponent
  ],
  templateUrl: './data-entry.component.html',
  styleUrl: './data-entry.component.scss'
})
export class DataEntryComponent {
  formData!: FormGroup;
  editId!: string | null;
  hide = true;
  currentFile?: File;
  avatarPreview: any;

  roleList: any = []

  listAction: any = {
    edit: false,
    view: false,
    create: false
  };

  constructor(private _roleService: RoleService, private _userService: UserService, private fb: FormBuilder, private spinner: NgxSpinnerService, private toastr: ToastrService, private route: ActivatedRoute) {
    this.getRoleAll();
    this.editId = this.route.snapshot.queryParamMap.get("id");
    this.formData = this.fb.group({
      id: [''],
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.pattern(RegexValidate.email)]],
      password: ['', [Validators.required]],
      passwordConfirmation: ['', [Validators.required]],
      roles: ['']
    }, {
      validators: this.passwordMatchValidator // Add custom validation function
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

  getRoleAll() {
    this._roleService.onGetAll().subscribe((res: any) => {
      if (res) {
        this.roleList = res.content;
      }
    })
  }

  getDetail() {
    this._userService.onGet(this.editId).subscribe((res: any) => {
      if (res) {
        this.formData.get('id')?.setValue(res.body.data.user_id);
        this.formData.get('avatar')?.setValue(res.body.data.avatar);
        this.formData.get('email')?.setValue(res.body.data.email);
        this.formData.get('lastname')?.setValue(res.body.data.lastname);
        this.formData.get('firstname')?.setValue(res.body.data.firstname);
        this.formData.get('roles')?.setValue(res.body.data.roles.map(function (value: { id: any; }) {
          return value.id;
        }));
        this.avatarPreview = environment.MINIO_URL + res.body.data.avatar;
      }
    })
  }

  submit() {
    const formData = new FormData();
    formData.append('firstname', this.formData.get('firstname')!.value);
    formData.append('lastname', this.formData.get('lastname')!.value);
    formData.append('email', this.formData.get('email')!.value);
    formData.append('roles', this.formData.get('roles')!.value);
    if (this.currentFile) {
      formData.append('file', this.currentFile);
    }

    if (this.editId) {
      formData.append('id', this.editId);
      this._userService.onUpdate(formData).subscribe((res: any) => {
        if (res && res.statusCodeValue === 200) {
          this.toastr.success("Update success", "Success");
        } else if (res.body.errors) {
          this.formData.get('email')?.setErrors({'unique': res.body.errors.email});
        } else {
          this.toastr.success("Error", "Fail");
        }
      })
    } else {
      formData.append('password', this.formData.get('password')!.value);
      this._userService.onCreate(formData).subscribe((res: any) => {
        if (res && res.statusCodeValue === 200) {
          this.toastr.success("Create success", "Success");
        } else if (res.body.errors) {
          this.formData.get('email')?.setErrors({'unique': res.body.errors.email});
        } else {
          this.toastr.success("Error", "Fail");
        }
      })
    }
  }


  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const passwordConfirmation = form.get('passwordConfirmation')?.value;

    if (password !== passwordConfirmation) {
      form.get('passwordConfirmation')?.setErrors({passwordMismatch: true});
    } else {
      form.get('passwordConfirmation')?.setErrors(null);
    }

    return null;
  }

  onFileChanged(event: any) {
    this.currentFile = event;
  }

  onRemoveFile() {
    this.avatarPreview = null;
  }

}
