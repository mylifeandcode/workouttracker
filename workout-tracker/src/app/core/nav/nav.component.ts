import { Component, Signal, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from 'app/core/_services/auth/auth.service';

@Component({
    selector: 'wt-nav',
    templateUrl: './nav.component.html',
    styleUrls: ['./nav.component.scss'],
    imports: [RouterLink]
})
export class NavComponent {
  private _authService = inject(AuthService);
  private _router = inject(Router);


  public userName: Signal<string | null> = computed(() => this._authService.currentUserName());
  public userIsLoggedIn: Signal<boolean> = computed(() => this._authService.currentUserName() != null);
  public userIsAdmin: Signal<boolean> = computed(() => this._authService.currentUserName() != null && this._authService.isUserAdmin);

  public logOff(): void {
    this._authService.logOut();
    this._router.navigate([this._authService.loginRoute]);
  }

}
