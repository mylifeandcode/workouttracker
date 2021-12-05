import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/core/user.service';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/auth.service';

@Component({
  selector: 'wt-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private _userService: UserService, private _router: Router, private _authService: AuthService) { }

  ngOnInit() {
  }

  public logOff(): void {
    this._authService.logOut();
    this._router.navigate(['login']);
  }

}
