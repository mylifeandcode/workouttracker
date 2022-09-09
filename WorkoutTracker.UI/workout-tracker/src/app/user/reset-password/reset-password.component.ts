import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'app/core/auth.service';
import { Observable, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

@Component({
  selector: 'wt-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  public validatingResetCode: boolean = true;
  public resetCodeInvalid: boolean = false;
  public errorMessage: string | null = null;

  constructor(
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService) { }

  public ngOnInit(): void {
    const resetCode: string = this._activatedRoute.snapshot.params["resetCode"];
    console.log("PARAMS: ", this._activatedRoute.snapshot.params);
    this._authService.validatePasswordResetCode(resetCode)
      .pipe(
        finalize(() => { this.validatingResetCode = false; }),
        catchError((err: any, caught: Observable<boolean>) => {
          this.errorMessage = (err.error ? err.error : "An error has occurred. Please contact an administrator.");
          return of(false);
        })        
      )
      .subscribe((isValid: boolean) => {
        this.resetCodeInvalid = !isValid;
      });
  }

}
