import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';

@Component({
    selector: 'wt-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
    imports: [RouterLink]
})
export class HomeComponent implements OnInit {

  constructor(private _router: Router, private _authService: AuthService) { }

  public ngOnInit(): void {
  }

  public logOff(): void {
    this._authService.logOut();
    this._router.navigate([this._authService.loginRoute]);
  }

}
