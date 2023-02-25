import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InProgressWorkoutsComponent } from './in-progress-workouts.component';

describe('InProgressWorkoutsComponent', () => {
  let component: InProgressWorkoutsComponent;
  let fixture: ComponentFixture<InProgressWorkoutsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InProgressWorkoutsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InProgressWorkoutsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
