import { Component, OnInit } from '@angular/core';
import { UserService } from 'app/users/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'wt-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  constructor(private _userService: UserService, private _router: Router) { }

  ngOnInit() {
  }

  public logOff(): void {
    this._userService.logOff();
    this._router.navigate(['login']);
  }

}
