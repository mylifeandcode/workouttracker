import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WorkoutSetDefinitionComponent } from './workout-set-definition.component';

describe('WorkoutSetDefinitionComponent', () => {
  let component: WorkoutSetDefinitionComponent;
  let fixture: ComponentFixture<WorkoutSetDefinitionComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WorkoutSetDefinitionComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutSetDefinitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
