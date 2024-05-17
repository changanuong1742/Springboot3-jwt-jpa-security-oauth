import {Component, OnInit} from '@angular/core';
import {MatTabsModule} from "@angular/material/tabs";
import {environment} from "../../../../environments/environment";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserProfileService} from "../../core/services/user-profile/user-profile.service";
import {NgIf} from "@angular/common";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";
import {AppService} from "../../core/services/app/app.service";
import {AppComponent} from "../../app.component";
import {RegexValidate} from "../../core/validators/regex.constants";
import {CookieService} from "ngx-cookie-service";
import {ChangePasswordComponent} from "../change-password/change-password.component";
import {UploadThumbnailComponent} from "../../shared/components/upload-thumbnail/upload-thumbnail.component";

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    MatTabsModule,
    ReactiveFormsModule,
    NgIf,
    ChangePasswordComponent,
    UploadThumbnailComponent
  ],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent {
  isConstructorFinished: boolean = false;
  changed: boolean = false;
  emailChanged: boolean = false;
  userInfo!: any;
  formData!: FormGroup;
  avatarPreview: any;
  currentFile?: File;
  timeWaitSendmail !: number;
  sentMail!: boolean;

  protected readonly environment = environment;

  constructor(private appComponent: AppComponent, private fb: FormBuilder, private _appService: AppService, private userProfileService: UserProfileService, private spinner: NgxSpinnerService, private toastr: ToastrService, private cookieService: CookieService) {
    this.spinner.show();
    this.formData = this.fb.group({
      firstname: ["", [Validators.required]],
      lastname: ["", [Validators.required]],
      email: ["", [Validators.required, Validators.pattern(RegexValidate.email)]],
      codeVerification: [""] // Thêm điều kiện tùy thuộc vào this.emailChanged
    });

    this.formData.valueChanges.subscribe(() => {
      this.changed = true; // Gán biến changed là true khi có sự thay đổi
    });

    this._appService.getAuthUserSubject().subscribe(data => {
      if (data) {
        this.userInfo = data;
        this.formData.patchValue({
          firstname: this.userInfo.firstName,
          lastname: this.userInfo.lastName,
          email: this.userInfo.email
        });
        this.avatarPreview = this.userInfo.avatar;
        this.changed = false;
        this.isConstructorFinished = true;
        this.spinner.hide();
      }
    });

    this.formData.get('email')!.valueChanges.subscribe((newValue: string) => {
      if (newValue !== this.userInfo.email) {
        this.emailChanged = true;
        // Thêm Validators.required cho trường codeVerify
        this.formData.get('codeVerification')!.setValidators([Validators.required]);
        // // Cập nhật FormControl
        this.formData.get('codeVerification')!.updateValueAndValidity();
      } else {
        this.emailChanged = false;
        // Xóa Validators.required cho trường codeVerify
        this.formData.get('codeVerification')!.clearValidators();
        // // Cập nhật FormControl
        this.formData.get('codeVerification')!.updateValueAndValidity();
      }
    });

    this.onComputeTimeWaitSendMail();
  }

  onComputeTimeWaitSendMail() {
    let currentTimeInSeconds = Math.floor(new Date(this.cookieService.get("timeOutSendMail")).getTime() / 1000);
    this.timeWaitSendmail = Math.floor(new Date().getTime() / 1000) - currentTimeInSeconds;
    const intervalId = setInterval(() => {
      if (this.timeWaitSendmail < 120) {
        this.timeWaitSendmail = this.timeWaitSendmail + 1;
        this.sentMail = true;
      } else {
        this.sentMail = false;
        clearInterval(intervalId);
      }
    }, 1000);
  }


  onFileChanged(event: any) {
    this.currentFile = event;
    this.changed = true;
  }

  onRemoveFile() {
    this.avatarPreview = null;
  }


  updateProfile() {
    this.spinner.show();
    if (this.changed) {
      if (this.formData.valid) {
        const formData = new FormData();
        formData.append('id', this.userInfo.id);
        formData.append('firstname', this.formData.get('firstname')!.value);
        formData.append('lastname', this.formData.get('lastname')!.value);
        formData.append('email', this.formData.get('email')!.value);
        if (this.emailChanged) {
          formData.append('codeVerification', this.formData.get('codeVerification')!.value);
        }
        if (this.currentFile) {
          formData.append('file', this.currentFile);
        }

        this.userProfileService.updateProfile(formData).subscribe((res: any) => {
          this.spinner.hide();
          if (res && res.statusCodeValue === 200) {
            this.toastr.success("Edit profile success", "Success");
            this.appComponent.getUser();
          } else {
            if (res.statusCodeValue != 200) {
              this.toastr.error(res.body.message, "Failed");
            } else {
              this.toastr.error("Not save form", "Failed");
            }
          }
        });
      } else {
        this.toastr.warning("Please complete the form", "Warning");
        this.spinner.hide();
      }
    } else {
      this.toastr.warning("Nothing changes", "Warning");
      this.spinner.hide();
    }
  }

  onRequestCodeChangeMail() {
    const formData = new FormData();
    formData.append('userid', this.userInfo.id);
    formData.append('type', "change-email");
    this.toastr.success("Request for confirmation code sent", "Success");
    this.cookieService.set('timeOutSendMail', new Date().toString(), {
      path: "/",
      sameSite: "Strict",
      domain: environment.DOMAIN_COOKIE
    });

    this.onComputeTimeWaitSendMail();
    this.userProfileService.requestCodeChangeMail(formData).subscribe((res: any) => {
    })
  }
}
