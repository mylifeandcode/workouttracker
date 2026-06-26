import { Component, ChangeDetectionStrategy } from '@angular/core';
import { NavComponent } from './core/nav/nav.component';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'wt-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [NavComponent, RouterOutlet]
})
export class AppComponent {
  title = 'Workout Tracker';
}
