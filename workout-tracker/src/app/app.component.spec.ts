import { TestBed, waitForAsync } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { provideRouter } from '@angular/router';
import { NavComponent } from './core/nav/nav.component';

@Component({
  selector: 'wt-nav',
  template: '',
  standalone: true
})
class MockNavComponent {

}

describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MockNavComponent,
        AppComponent
      ],
      providers: [
        provideRouter([])
      ]
    }).overrideComponent(
      AppComponent,
      {
        remove: { imports: [NavComponent] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      }
    ).compileComponents();
  }));

  it('should create the app', waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it(`should have as title 'Workout Tracker'`, waitForAsync(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('Workout Tracker');
  }));

});

