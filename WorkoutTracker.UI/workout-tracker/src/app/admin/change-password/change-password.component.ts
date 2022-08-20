import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from 'app/core/models/user';
import { UserService } from 'app/core/user.service';
import { CustomValidators } from 'app/validators/custom-validators';
import { Subscription } from 'rxjs';

interface IChangePasswordForm {
  currentPassword: FormControl<string>;
  password: FormControl<string>;
  confirmPassword: FormControl<string>;
}

@Component({
  selector: 'wt-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit, OnDestroy {

  public loading: boolean = true;
  public userName: string | undefined = undefined;
  public changePasswordForm: FormGroup<IChangePasswordForm>;
  public errorMsg: string | null = null;
  public changingPassword: boolean = false;
  private _users$: Subscription | null = null;
  private _userId: number = 0;
  private _user: User | undefined = undefined;

  constructor(
    private _activatedRoute: ActivatedRoute, 
    private _router: Router,
    private _userService: UserService,
    private _formBuilder: FormBuilder) { }

  public ngOnInit(): void {
    this._userId = this._activatedRoute.snapshot.params['id'];
    this._users$ = this._userService.all$.subscribe((users: User[]) => {
      this._user = users.find((value: User) => value.id == this._userId);
      this.userName = this._user?.name;
      this.createForm();
      this.loading = false;
    });
  }

  public ngOnDestroy(): void {
    if(this._users$)
      this._users$.unsubscribe();
  }

  public changePassword(): void {}

  public cancel(): void {

    if (this.changePasswordForm.dirty && !window.confirm("Cancel without changing password?"))
        return;

    this._router.navigate(['/']);

  }

  private createForm(): void {

    this.changePasswordForm = this._formBuilder.group<IChangePasswordForm>({
      currentPassword: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      password: new FormControl<string>('', { nonNullable: true, validators: [ Validators.required, Validators.minLength(7) ]}),
      confirmPassword: new FormControl<string>('', { nonNullable: true, validators: [ Validators.required, Validators.minLength(7) ]}),
    }, { validators: CustomValidators.passwordsMatch });

  }

}
