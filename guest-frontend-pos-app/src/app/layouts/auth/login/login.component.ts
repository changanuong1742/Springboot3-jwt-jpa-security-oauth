import {Component} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {AuthService} from "../../../core/services/auth/auth.service";
import {NgIf} from "@angular/common";
import {RegexValidate} from "../../../core/validators/regex.constants";
import {Subscription} from "rxjs";
import {MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition} from "@angular/material/snack-bar";
import {CookieService} from "ngx-cookie-service";
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgIf
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  formData!: FormGroup;
  errorMessage!: string | null;
  errorMessageSubscription: Subscription | undefined;

  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  urlLoginGoogle: string = "";

  constructor(private fb: FormBuilder, private _authService: AuthService, private _snackBar: MatSnackBar, private cookieService: CookieService, private router: Router) {

    if (this.cookieService.get("userId")) {
      this.router.navigate(['/']);
    }

    this.formData = this.fb.group({
      email: ['', [Validators.required, Validators.minLength(10), Validators.pattern(RegexValidate.email),]],
      password: ['', [Validators.required]]
    });

    this.errorMessageSubscription = this._authService.getErrorMessage().subscribe(message => {
      this.errorMessage = message;
      if (this.errorMessage != null) {
        this.openSnackBar(this.errorMessage, "snackBarFail");
      }
    });

    this._authService.getUrlGoogleLogin().subscribe((data: any) => {
      this.urlLoginGoogle = data.url;
    });

  }

  async submit() {
    this._authService.onLogin(this.formData.getRawValue());
  }

  ngOnDestroy() {
    if (this.errorMessageSubscription) {
      this.errorMessageSubscription.unsubscribe();
    }
  }

  openSnackBar(message: string, className: string) {
    if (this.errorMessage != null && !this.formData.invalid) {
      this._snackBar.open(this.errorMessage, "", {
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition,
        duration: 2000,
        panelClass: [className]
      });
    }
  }
}
