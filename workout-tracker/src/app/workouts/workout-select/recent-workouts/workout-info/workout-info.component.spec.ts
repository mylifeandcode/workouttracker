import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WorkoutInfoComponent } from './workout-info.component';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { ResistanceTypePipe } from 'app/workouts/_pipes/resistance-type.pipe';
import { TargetAreasPipe } from 'app/workouts/_pipes/target-areas.pipe';

describe('WorkoutInfoComponent', () => {
  let component: WorkoutInfoComponent;
  let fixture: ComponentFixture<WorkoutInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [WorkoutInfoComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        provideZonelessChangeDetection()
    ]
})
  .overrideComponent(
    WorkoutInfoComponent, {
      remove: { imports: [ NzSpinModule, ResistanceTypePipe, TargetAreasPipe ] },
      add: { schemas: [ CUSTOM_ELEMENTS_SCHEMA ] }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
