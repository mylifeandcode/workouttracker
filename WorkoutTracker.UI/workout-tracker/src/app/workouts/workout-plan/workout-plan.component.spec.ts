import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ResistanceBandService } from 'app/admin/resistance-bands/resistance-band.service';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { DialogComponentMock } from 'app/testing/component-mocks/primeNg/p-dialog-mock';
import { ProgressSpinnerComponentMock } from 'app/testing/component-mocks/primeNg/p-progress-spinner-mock';
import { of } from 'rxjs';
import { ResistanceBandSelection } from '../models/resistance-band-selection';
import { WorkoutPlan } from '../models/workout-plan';
import { ResistanceBandSelectComponent } from '../resistance-band-select/resistance-band-select.component';
import { WorkoutService } from '../workout.service';

import { WorkoutPlanComponent } from './workout-plan.component';

class WorkoutServiceMock {
  getPlan = jasmine.createSpy('getPlan').and.returnValue(of(new WorkoutPlan()));
  submitPlanForPast = jasmine.createSpy('submitPlanForPast').and.returnValue(of(12));
  submitPlan = jasmine.createSpy('submitPlan').and.returnValue(of(5));
  submitPlanForLater = jasmine.createSpy('submitPlanForLater').and.returnValue(of(32));
}

class ResistanceBandServiceMock {
  getAllIndividualBands = 
    jasmine.createSpy('getAllIndividualBands')
      .and.callFake(() => {
        let bands: ResistanceBandIndividual[] = [];
        bands.push(new ResistanceBandIndividual("Orange", 30));
        bands.push(new ResistanceBandIndividual("Purple", 23));
        return of(bands);
      });
}

@Component({
  selector: 'wt-resistance-band-select',
  template: ''
})
class ResistanceBandSelectComponentMock extends ResistanceBandSelectComponent {

  @Input()
  public resistanceBandInventory: ResistanceBandIndividual[];

  @Output()
  public okClicked: EventEmitter<ResistanceBandSelection> = new EventEmitter<ResistanceBandSelection>();

  @Output()
  public cancelClicked: EventEmitter<void> = new EventEmitter<void>();

  setBandAllocation = jasmine.createSpy('setBandAllocation');

}

describe('WorkoutPlanComponent', () => {
  let component: WorkoutPlanComponent;
  let fixture: ComponentFixture<WorkoutPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        WorkoutPlanComponent, 
        DialogComponentMock, 
        ResistanceBandSelectComponentMock, 
        ProgressSpinnerComponentMock
      ], 
      providers: [
        {
          provide: WorkoutService, 
          useClass: WorkoutServiceMock
        }, 
        {
          provide: ResistanceBandService, 
          useClass: ResistanceBandServiceMock
        }, 
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        },
        FormBuilder //TODO: Determine if this is kosher or if there's a preferred mocking approach
      ],
      imports: [
        RouterTestingModule, 
        ReactiveFormsModule
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit plan', () => {
    
    //ARRANGE
    const router = TestBed.inject(Router);
    const workoutService = TestBed.inject(WorkoutService);
    spyOn(router, 'navigate');

    //ACT
    component.startWorkout();

    //ASSERT
    let workoutPlan: WorkoutPlan = new WorkoutPlan(); //To keep the compiler happy
    if (component.workoutPlan == null)
      fail("component.workoutPlan is null.");
    else
      workoutPlan = component.workoutPlan;

    expect(workoutService.submitPlan).toHaveBeenCalledWith(workoutPlan);
    expect(router.navigate).toHaveBeenCalledWith(['workouts/start/5']);

  });

  it('should submit plan for later', () => {

    //ARRANGE
    const router = TestBed.inject(Router);
    const workoutService = TestBed.inject(WorkoutService);
    spyOn(router, 'navigate');

    //ACT
    component.submitPlanForLater();

    //ASSERT
    let workoutPlan: WorkoutPlan = new WorkoutPlan(); //To keep the compiler happy
    if (component.workoutPlan == null)
      fail("component.workoutPlan is null.");
    else
      workoutPlan = component.workoutPlan;

    expect(workoutService.submitPlanForLater).toHaveBeenCalledWith(workoutPlan);
    expect(router.navigate).toHaveBeenCalledWith(['workouts/select-planned']);

  });

  it('should determine plan is for past workout based on route params', () => {
    
    //ARRANGE
    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.params = 
      of({ 
        start: new Date(2022, 3, 22, 12, 13, 0),
        end: new Date(2022, 3, 22, 13, 35, 6) 
      });

    //ACT
    component.ngOnInit(); //Because we changed the activated route

    //ASSERT
    expect(component.isForPastWorkout).toBeTrue();

  });

  it('should determine plan is not for past workout based on route params', () => {
    //Using default mock, no change is required, and default expectation is false
    expect(component.isForPastWorkout).toBeFalse();
  });
  
  it('should submit plan for a past workout', () => {

    //ARRANGE
    const startDate = new Date(2022, 3, 22, 12, 13, 0);
    const endDate = new Date(2022, 3, 22, 13, 35, 6);

    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.params = 
      of({ 
        start: startDate,
        end: endDate
      });
    
    const workoutService = TestBed.inject(WorkoutService);
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');

    component.ngOnInit(); //Because we changed the activated route

    //ACT
    component.submitPlanForPast();

    //ASSERT
    let workoutPlan: WorkoutPlan = new WorkoutPlan(); //Compiler was being goofy about this, saying the value was being used before being assigned, even though that was not the case!
    if (component.workoutPlan == null)
      fail("component.workoutPlan is null.");
    else
      workoutPlan = component.workoutPlan;

    expect(workoutPlan.pastWorkoutStartDateTime).toEqual(startDate);
    expect(workoutPlan.pastWorkoutEndDateTime).toEqual(endDate);
    expect(component.workoutPlan).not.toBeNull();
    expect(workoutService.submitPlanForPast).toHaveBeenCalledWith(workoutPlan, startDate, endDate);
    expect(router.navigate).toHaveBeenCalledWith(["workouts/start/12"], { queryParams: { pastWorkout: true }});

  });

});
