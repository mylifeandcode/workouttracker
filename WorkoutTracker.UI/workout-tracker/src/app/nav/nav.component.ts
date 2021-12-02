import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'wt-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  public userName: string;

  get userIsLoggedIn(): boolean {
   return this.userName != null;
  }

  constructor(private _authService: AuthService, private _router: Router) { }

  public ngOnInit(): void {
    this._authService.currentUserName.subscribe(
      (username: string) => {
        this.userName = username;
      });
  }

  public logOff(): void {
    this._authService.logOff();
    this._router.navigate(['login']);
  }

}
