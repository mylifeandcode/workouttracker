import { Component, Signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'app/core/services/auth/auth.service';

@Component({
  selector: 'wt-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.scss']
})
export class NavComponent {

  public userName: Signal<string | null> = computed(() => this._authService.currentUserName());
  public userIsLoggedIn: Signal<boolean> = computed(() => this._authService.currentUserName() != null);
  public userIsAdmin: Signal<boolean> = computed(() => this._authService.currentUserName() != null && this._authService.isUserAdmin);

  constructor(private _authService: AuthService, private _router: Router) { }

  public logOff(): void {
    this._authService.logOut();
    this._router.navigate([this._authService.loginRoute]);
  }

}
