import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from 'app/core/models/user';
import { UserNewDTO } from 'app/core/models/user-new-dto';
import { UserService } from 'app/core/user.service';
import { CustomValidators } from 'app/validators/custom-validators';
import { finalize } from 'rxjs/operators';

interface IUserAddForm {
  name: FormControl<string>;
  password: FormControl<string>; 
  confirmPassword: FormControl<string>; 
  role: FormControl<number>;
}

@Component({
  selector: 'wt-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.css']
})
export class UserAddComponent implements OnInit {

  public errorMsg: string;
  public userAddForm: FormGroup<IUserAddForm>;
  public savingUserInfo: boolean = false;

  constructor(
    private _userSvc: UserService, 
    private _formBuilder: FormBuilder, 
    private _router: Router) { }

  public ngOnInit(): void {
    this.createForm();
  }

  public addUser(): void {
    this.savingUserInfo = true;
    const user = this.getUserForPersist();

    this._userSvc.addNew(user)
      .pipe(finalize(() => { this.savingUserInfo = false; }))
      .subscribe(
        (savedUser: User) => this._router.navigate(['admin/users']), //TODO: Find out how to make this relative, not absolute
        (error: any) => { 
          if(error?.status == 403)
            this.errorMsg = "You do not have permission to add users.";
          else
            this.errorMsg = error.error ? error.error : "An error has occurred. Please contact an administrator.";
        });

  }

  public cancel(): void {
    if (this.userAddForm.dirty && !window.confirm("Cancel without saving changes?"))
        return;

    this._router.navigate(['/admin/users']);
  }

  private createForm(): void {

    this.userAddForm = this._formBuilder.group<IUserAddForm>({
      name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      password: new FormControl<string>('', { nonNullable: true, validators: [ Validators.required, Validators.minLength(7) ]}),
      confirmPassword: new FormControl<string>('', { nonNullable: true, validators: [ Validators.required, Validators.minLength(7) ]}),
      role: new FormControl<number>(0, { nonNullable: true, validators: [ Validators.required, Validators.min(1), Validators.max(2) ]})
    }, { validators: CustomValidators.passwordsMatch });

  }
  
  private getUserForPersist(): UserNewDTO {
    const user = new UserNewDTO();

    user.userName = this.userAddForm.controls.name.value;
    user.password = this.userAddForm.controls.password.value;
    user.role = this.userAddForm.controls.role.value;

    return user;
  }  

}
