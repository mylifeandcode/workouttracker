import { Component } from '@angular/core';
import { ActivatedRoute, Router, UrlSegment, Event, NavigationEnd } from '@angular/router';

@Component({
  selector: 'wt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  constructor(private _router: Router) {
    this._router.events.subscribe((event: Event) => {
      if(event instanceof NavigationEnd)
        console.log("CURRENT URL: ", event.url);
    });
  }
}
