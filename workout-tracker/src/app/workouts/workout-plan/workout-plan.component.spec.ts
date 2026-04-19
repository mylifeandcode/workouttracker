import { CUSTOM_ELEMENTS_SCHEMA, Component, EventEmitter, Output, input, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ResistanceBandService } from '../../shared/services/resistance-band.service';
import { ResistanceBandIndividual } from '../../shared/models/resistance-band-individual';
import { of } from 'rxjs';
import { ResistanceBandSelection } from '../_models/resistance-band-selection';
import { ExercisePlan, WorkoutPlan } from '../../api';
import { ResistanceBandSelectComponent } from '../_shared/resistance-band-select/resistance-band-select.component';
import { WorkoutService } from '../_services/workout.service';

import { WorkoutPlanComponent } from './workout-plan.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { type Mocked } from 'vitest';

@Component({
  selector: 'wt-resistance-band-select',
  template: '',
  imports: [ReactiveFormsModule]
})
class MockResistanceBandSelectComponent extends ResistanceBandSelectComponent {

  public override readonly resistanceBandInventory = input<ResistanceBandIndividual[]>([]);

  @Output()
  public override okClicked: EventEmitter<ResistanceBandSelection> = new EventEmitter<ResistanceBandSelection>();

  @Output()
  public override cancelClicked: EventEmitter<void> = new EventEmitter<void>();

  override setBandAllocation = vi.fn();
}

describe('WorkoutPlanComponent', () => {
  let component: WorkoutPlanComponent;
  let fixture: ComponentFixture<WorkoutPlanComponent>;

  beforeEach(async () => {
    const WorkoutServiceMock: Partial<Mocked<WorkoutService>> = {
      getNewPlan: vi.fn().mockReturnValue(of(<WorkoutPlan>{ exercises: Array<ExercisePlan>() })),
      submitPlanForPast: vi.fn().mockReturnValue(of(12)),
      submitPlan: vi.fn().mockReturnValue(of(5)),
      submitPlanForLater: vi.fn().mockReturnValue(of(32))
    };

    const MockResistanceBandService: Partial<Mocked<ResistanceBandService>> = {
      getAllIndividualBands: vi.fn().mockImplementation(() => {
        const bands: ResistanceBandIndividual[] = [];
        bands.push(new ResistanceBandIndividual("Orange", 30));
        bands.push(new ResistanceBandIndividual("Purple", 23));
        return of(bands);
      })
    };

    await TestBed.configureTestingModule({
      providers: [
        {
          provide: WorkoutService,
          useValue: WorkoutServiceMock
        },
        {
          provide: ResistanceBandService,
          useValue: MockResistanceBandService
        },
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        },
        UntypedFormBuilder, //TODO: Determine if this is kosher or if there's a preferred mocking approach
        provideZonelessChangeDetection()
      ],
      imports: [
        RouterModule.forRoot([]),
        ReactiveFormsModule,
        WorkoutPlanComponent,
        MockResistanceBandSelectComponent
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(WorkoutPlanComponent, {
        remove: { imports: [NzSpinModule, NzModalModule] },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutPlanComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', 'testComponentId');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should submit plan', () => {

    //ARRANGE
    const router = TestBed.inject(Router);
    const workoutService = TestBed.inject(WorkoutService);
    vi.spyOn(router, 'navigate');

    //ACT
    component.startWorkout();

    //ASSERT
    let workoutPlan: WorkoutPlan = <WorkoutPlan>{}; //To keep the compiler happy
    if (component.workoutPlan() == null)
      throw new Error("component.workoutPlan is null.");
    else
      workoutPlan = component.workoutPlan()!;

    expect(workoutService.submitPlan).toHaveBeenCalledWith(workoutPlan);
    expect(router.navigate).toHaveBeenCalledWith(['workouts/start/5']);

  });

  it('should submit plan for later', () => {

    //ARRANGE
    const router = TestBed.inject(Router);
    const workoutService = TestBed.inject(WorkoutService);
    vi.spyOn(router, 'navigate');

    //ACT
    component.submitPlanForLater();

    //ASSERT
    let workoutPlan: WorkoutPlan = <WorkoutPlan>{}; //To keep the compiler happy
    if (component.workoutPlan() == null)
      throw new Error("component.workoutPlan is null.");
    else
      workoutPlan = component.workoutPlan()!;

    expect(workoutService.submitPlanForLater).toHaveBeenCalledWith(workoutPlan);
    expect(router.navigate).toHaveBeenCalledWith(['workouts/select-planned']);

  });

  it('should determine plan is for past workout based on route params', () => {

    //ARRANGE
    fixture.componentRef.setInput('start', "2022-03-22T12:13:00");
    fixture.componentRef.setInput('end', "2022-03-22T13:35:06");

    //ACT
    component.ngOnInit(); //Because we changed the activated route

    //ASSERT
    expect(component.isForPastWorkout).toBe(true);

  });

  it('should determine plan is not for past workout based on route params', () => {
    //Using default mock, no change is required, and default expectation is false
    expect(component.isForPastWorkout).toBe(false);
  });

  it('should submit plan for a past workout', () => {

    //ARRANGE
    const startDate = new Date(2022, 3, 22, 12, 13, 0);
    const endDate = new Date(2022, 3, 22, 13, 35, 6);
    fixture.componentRef.setInput('start', startDate.toISOString());
    fixture.componentRef.setInput('end', endDate.toISOString());

    const workoutService = TestBed.inject(WorkoutService);
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate');

    component.ngOnInit();

    //ACT
    component.submitPlanForPast();

    //ASSERT
    let workoutPlan: WorkoutPlan = <WorkoutPlan>{};
    if (component.workoutPlan() == null)
      throw new Error("component.workoutPlan is null.");
    else
      workoutPlan = component.workoutPlan()!;

    expect(component.workoutPlan()).not.toBeNull();
    expect(workoutService.submitPlanForPast).toHaveBeenCalledWith(workoutPlan, startDate, endDate);
    expect(router.navigate).toHaveBeenCalledWith(["workouts/start/12"], { queryParams: { pastWorkout: true } });

  });

});
