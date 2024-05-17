import {Component} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {RegexValidate} from "../../core/validators/regex.constants";
import {AppComponent} from "../../app.component";
import {AppService} from "../../core/services/app/app.service";
import {UserProfileService} from "../../core/services/user-profile/user-profile.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {CookieService} from "ngx-cookie-service";
import {ChangePasswordService} from "../../core/services/change-password/change-password.service";

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss'
})
export class ChangePasswordComponent {

  formData!: FormGroup;

  constructor(private appComponent: AppComponent, private fb: FormBuilder, private _appService: AppService, private userProfileService: UserProfileService, private spinner: NgxSpinnerService, private toastr: ToastrService, private changePasswordService: ChangePasswordService) {
    this.formData = this.fb.group({
      passwordOld: ["", [Validators.required]],
      passwordNew: ["", [Validators.required]],
      passwordNewConfirm: ["", [Validators.required]],
    });
  }


  onSubmitChangePassword() {

    if (this.formData.valid) {

      if (this.formData.getRawValue().passwordNew != this.formData.getRawValue().passwordNewConfirm) {
        this.toastr.warning("Passwords do not match.", "Warning");
        return;
      }

      const formData = new FormData();
      formData.append('passwordOld', this.formData.get('passwordOld')!.value);
      formData.append('passwordNew', this.formData.get('passwordNew')!.value);

      this.changePasswordService.changePassword(formData).subscribe((res: any) => {
        this.spinner.show();
        if (res && res.body.succeeded == true) {
          this.toastr.success("Change password success", "Success");
        } else {
          if (res.body.messages.length) {
            for (let i = 0; i < res.body.messages.length; i++) {
              this.toastr.error(res.body.messages[i], "Failed");
            }
          } else {
            this.toastr.error("Not save form", "Failed");
          }
        }
        this.spinner.hide();
      });

    }

  }

}
