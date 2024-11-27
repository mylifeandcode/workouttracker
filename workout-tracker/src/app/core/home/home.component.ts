import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';

@Component({
    selector: 'wt-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [RouterLink]
})
export class HomeComponent implements OnInit {
  private _router = inject(Router);
  private _authService = inject(AuthService);


  public ngOnInit(): void {
  }

  public logOff(): void {
    this._authService.logOut();
    this._router.navigate([this._authService.loginRoute]);
  }

}
