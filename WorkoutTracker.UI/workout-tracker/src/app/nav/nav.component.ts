import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'wt-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  public userName: string | null;
  public userIsLoggedIn: boolean;
  public userIsAdmin: boolean;

  constructor(private _authService: AuthService, private _router: Router) { }

  public ngOnInit(): void {
    this._authService.currentUserName.subscribe(
      (username: string | null) => {
        this.userName = username;
        this.userIsLoggedIn = (username != null);
        this.userIsAdmin = this._authService.isUserAdmin;
      });

  }

  public logOff(): void {
    this._authService.logOut();
    this._router.navigate([this._authService.loginRoute]);
  }

}
