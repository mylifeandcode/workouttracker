import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { User } from 'app/core/_models/user';
import { UserNewDTO } from 'app/core/_models/user-new-dto';
import { AuthService } from 'app/core/_services/auth/auth.service';
import { UserService } from 'app/core/_services/user/user.service';
import { CustomValidators } from 'app/core/_validators/custom-validators';
import { finalize } from 'rxjs/operators';

interface IUserAddForm {
  name: FormControl<string>;
  emailAddress: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
  role: FormControl<number>;
}

@Component({
    selector: 'wt-user-add',
    templateUrl: './user-add.component.html',
    styleUrls: ['./user-add.component.scss'],
    imports: [FormsModule, ReactiveFormsModule, RouterLink]
})
export class UserAddComponent implements OnInit {
  private _userService = inject(UserService);
  private _formBuilder = inject(FormBuilder);
  private _router = inject(Router);
  private _activatedRoute = inject(ActivatedRoute);
  private _authService = inject(AuthService);

  public errorMsg: string | undefined;
  public userAddForm: FormGroup<IUserAddForm>;
  public savingUserInfo: boolean = false;
  public showAdminControls: boolean = false;

  constructor() {
    this.userAddForm = this.createForm();
  }

  public ngOnInit(): void {
    this.showAdminControls = (this._activatedRoute.routeConfig?.path == 'users/add');
  }

  public addUser(): void {
    this.savingUserInfo = true;
    const user = this.getUserForPersist();

    this._userService.addNew(user)
      .pipe(finalize(() => { this.savingUserInfo = false; }))
      .subscribe({
        next: (savedUser: User) => {
          if (this._authService.isUserLoggedIn)
            this._router.navigate(['admin/users']); //TODO: Find out how to make this relative, not absolute
          else
            this._router.navigate(['/']);
        }, 
        error: (error: any) => {
          if (error?.status == 403)
            this.errorMsg = "You do not have permission to add users.";
          else
            this.errorMsg = error.error ? error.error : "An error has occurred. Please contact an administrator.";
        }
      });

  }

  public cancel(): void {
    if (this.userAddForm.dirty && !window.confirm("Cancel without saving changes?"))
      return;

    if (this.showAdminControls)
      this._router.navigate(['/admin/users']);
    else
      this._router.navigate(['/']);
  }

  private createForm(): FormGroup<IUserAddForm> {

    return this._formBuilder.group<IUserAddForm>({
      name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      emailAddress: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
      password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(7)] }),
      confirmPassword: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(7)] }),
      role: new FormControl<number>((this.showAdminControls ? 0 : 1), { nonNullable: true, validators: [Validators.required, Validators.min(1), Validators.max(2)] })
    }, { validators: CustomValidators.passwordsMatch });

  }

  private getUserForPersist(): UserNewDTO {
    const user = new UserNewDTO();

    user.userName = this.userAddForm.controls.name.value;
    user.emailAddress = this.userAddForm.controls.emailAddress.value;
    user.password = this.userAddForm.controls.password.value;
    user.role = this.userAddForm.controls.role.value;

    return user;
  }

}
