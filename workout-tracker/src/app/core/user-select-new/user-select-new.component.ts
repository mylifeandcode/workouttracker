import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { User } from 'app/core/models/user';
import { UserNewDTO } from 'app/core/models/user-new-dto';
import { UserService } from 'app/core/services/user/user.service';
import { finalize } from 'rxjs/operators';

interface INewUserForm {
  name: FormControl<string>;
  emailAddress: FormControl<string>;
}

/**
 * This component is for new user creation when the loginWithUserSelect mode is enabled
 */
@Component({
    selector: 'wt-user-select-new',
    templateUrl: './user-select-new.component.html',
    styleUrls: ['./user-select-new.component.scss'],
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, RouterLink]
})
export class UserSelectNewComponent {

  public newUserForm: FormGroup<INewUserForm>;
  public errorMsg: string | undefined = undefined;
  public addingUser: boolean = false;
  
  constructor(
    private _formBuilder: FormBuilder, 
    private _userService: UserService,
    private _router: Router) { 
      this.newUserForm = this.createForm();
  }

  public addUser(): void {
    const user = this.getUserForPersist();
    
    this.addingUser = true;
    this._userService.addNew(user)
      .pipe(
        finalize(() => { this.addingUser = false; })
      )
      .subscribe((addedUser: User) => {
        this._router.navigate(['/user-select']);
      });
  }

  private createForm(): FormGroup<INewUserForm> {
    return this._formBuilder.group<INewUserForm>({
      name: new FormControl<string>('', { nonNullable: true, validators: Validators.required }),
      emailAddress: new FormControl<string>('', { nonNullable: true, validators: [ Validators.required, Validators.email ]}),
    });
  }

  private getUserForPersist(): UserNewDTO {
    const user = new UserNewDTO();
    user.userName = this.newUserForm.controls.name.value.trim();
    user.emailAddress = this.newUserForm.controls.emailAddress.value.trim();
    user.password = "No Password. User-select mode!";

    return user;
  }

}
