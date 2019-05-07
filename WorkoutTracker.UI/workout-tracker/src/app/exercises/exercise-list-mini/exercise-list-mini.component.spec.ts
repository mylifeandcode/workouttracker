import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseListMiniComponent } from './exercise-list-mini.component';

describe('ExerciseListMiniComponent', () => {
  let component: ExerciseListMiniComponent;
  let fixture: ComponentFixture<ExerciseListMiniComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExerciseListMiniComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseListMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
