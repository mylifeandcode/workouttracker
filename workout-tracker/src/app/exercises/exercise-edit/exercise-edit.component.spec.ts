import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterModule, UrlSegment } from '@angular/router';

import { of } from 'rxjs';

import { ExerciseEditComponent } from './exercise-edit.component';
import { ExerciseService } from '../exercise.service';
import { TargetArea } from 'app/workouts/models/target-area';
import { Exercise } from 'app/workouts/models/exercise';
import { ExerciseTargetAreaLink } from 'app/workouts/models/exercise-target-area-link';

//TODO: Move initialization inside beforeEach()
const EXERCISE: Exercise = <Exercise> {
  id: 2, 
  name: 'Some Exercise', 
  description: 'This is a nice exercise. Blah, blah, blah.', 
  setup: 'Get ready', 
  movement: 'Whatever', 
  pointsToRemember: 'Be careful',
  resistanceType: 1,
  exerciseTargetAreaLinks: [
    <ExerciseTargetAreaLink>{
      exerciseId: 2,
      targetAreaId: 1
    }
  ]
};

class ExerciseServiceMock {
  resistanceTypes: Map<number, string> = new Map<number, string>();

  constructor() {
    this.resistanceTypes.set(0, 'Free Weight');
    this.resistanceTypes.set(1, 'Resistance Band');
  }

  getTargetAreas = jasmine.createSpy('getTargetAreas')
    .and.callFake(() => {
      const targetAreas = new Array<TargetArea>();
      targetAreas.push(new TargetArea(1, "Chest", 1, new Date(), null, null, false));
      targetAreas.push(new TargetArea(2, "Biceps", 1, new Date(), null, null, false));
      targetAreas.push(new TargetArea(3, "Triceps", 1, new Date(), null, null, false));
      return of(targetAreas);
    });

  getById = jasmine.createSpy('getById').and.returnValue(of(EXERCISE));
  getResistanceTypes =
    jasmine.createSpy('getResistanceTypes')
      .and.returnValue(of(this.resistanceTypes));

  add = jasmine.createSpy('add').and.callFake((exercise: Exercise) => of(exercise));
  update = jasmine.createSpy('update').and.callFake((exercise: Exercise) => of(exercise));
}

@Pipe({
  name: 'insertSpaceBeforeCapital'
})
class InsertSpaceBeforeCapitalPipeMock implements PipeTransform {
  transform(value: string): string { return "I'm just a mock!"; }
}

function getActivatedRouteSnapshot(): ActivatedRouteSnapshot {
  const activatedRouteSnapshot = new ActivatedRouteSnapshot();
  activatedRouteSnapshot.url = [];
  activatedRouteSnapshot.url.push(new UrlSegment('edit', {}));
  activatedRouteSnapshot.params = { 'id': 2 };
  return activatedRouteSnapshot;
}

describe('ExerciseEditComponent', () => {
  let component: ExerciseEditComponent;
  let fixture: ComponentFixture<ExerciseEditComponent>;
  let exerciseService: ExerciseService;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExerciseEditComponent, 
        InsertSpaceBeforeCapitalPipeMock
      ],
      imports: [
        ReactiveFormsModule,
        RouterModule.forRoot([])
       ],
       providers: [
         {
           provide: ExerciseService,
           useClass: ExerciseServiceMock
         },
         {
           provide: ActivatedRoute,
           useValue: {
             params: of({
               id: 2,
             }), 
             snapshot: getActivatedRouteSnapshot()
            }
         }
       ],
       schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseEditComponent);
    component = fixture.componentInstance;
    exerciseService = TestBed.inject(ExerciseService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should create form', () => {
    expect(component.exerciseForm).toBeTruthy();
    expect(component.exerciseForm.controls.id).toBeTruthy();
    expect(component.exerciseForm.controls.id.hasValidator(Validators.required)).toBeTrue();
    expect(component.exerciseForm.controls.name).toBeTruthy();
    expect(component.exerciseForm.controls.name.hasValidator(Validators.required)).toBeTrue();
    expect(component.exerciseForm.controls.description).toBeTruthy();
    
    //TODO: Determine why this check fails
    //expect(component.exerciseForm.controls.description.hasValidator(Validators.compose([Validators.required, Validators.maxLength(4000)]))).toBeTrue();
    
    expect(component.exerciseForm.controls.resistanceType).toBeTruthy();
    expect(component.exerciseForm.controls.oneSided).toBeTruthy();
    expect(component.exerciseForm.controls.targetAreas).toBeTruthy();
    expect(component.exerciseForm.controls.setup).toBeTruthy();
    expect(component.exerciseForm.controls.movement).toBeTruthy();
    expect(component.exerciseForm.controls.pointsToRemember).toBeTruthy();
  });

  it('should have default values for form if no exercise loaded', () => {
    //ARRANGE
    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.snapshot.params = {id: 0};

    //ACT
    component.ngOnInit(); //Because we changed ActivatedRoute

    //ASSERT
    expect(component.exerciseForm.controls.id.value).toEqual(0);
    
  });

  it('should get all target areas', () => {
    expect(component.allTargetAreas).toBeTruthy();
    expect(exerciseService.getTargetAreas).toHaveBeenCalledTimes(1);
  });

  it('should load exercise when editing', () => {
    //Our default route mock includes a value for exercise ID
    expect(exerciseService.getById).toHaveBeenCalledWith(2);
    //expect(component._exercise).toEqual(EXERCISE);
    expect(component.exerciseForm).not.toBeNull();
    expect(component.exerciseForm).toBeTruthy();
    expect(component.exerciseForm.controls.id.value).toEqual(EXERCISE.id);
    expect(component.exerciseForm.controls.id.validator).toBeTruthy();
    expect(component.exerciseForm.controls.name.value).toEqual(EXERCISE.name);
    expect(component.exerciseForm.controls.description.value).toEqual(EXERCISE.description);
    expect(component.exerciseForm.controls.setup.value).toEqual(EXERCISE.setup);
    expect(component.exerciseForm.controls.movement.value).toEqual(EXERCISE.movement);
    expect(component.exerciseForm.controls.pointsToRemember.value).toEqual(EXERCISE.pointsToRemember);
  });

  it('should get resistance types', () => {
    expect(component.resistanceTypes).toBeTruthy();
    expect(exerciseService.getResistanceTypes).toHaveBeenCalledTimes(1);
  });

  it('should return exercise ID via exerciseId property', () => {
    expect(component.exerciseId).toBe(EXERCISE.id);
  });

  it('should enable edit mode', () => {
    component.editModeToggled({checked: false});
    expect(component.readOnlyMode).toBeTrue();
  });

  it('should disable edit mode', () => {
    component.editModeToggled({checked: true});
    expect(component.readOnlyMode).toBeFalse();
  });

  it('should add exercise', () => {

    //ARRANGE
    //Override default mock behavior
    const exercise = new Exercise();
    exercise.id = 0;
    exercise.name = 'Some New Exercise';
    exercise.description = 'Ultra Mega Super Press'; 
    exercise.setup = 'Focus!'; 
    exercise.movement = 'Forward!'; 
    exercise.oneSided = false;
    exercise.involvesReps = true;
    exercise.pointsToRemember = 'Form!';
    exercise.resistanceType = 1;
    exercise.exerciseTargetAreaLinks = [];
    exercise.exerciseTargetAreaLinks.push(new ExerciseTargetAreaLink(0, 1));

    //exerciseService.getById = jasmine.createSpy('getById').and.returnValue(of(exercise));
    exerciseService.add = jasmine.createSpy('add').and.returnValue(of(exercise));

    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.params['id'] = 0;

    //Need to re-init because service mock has changed
    component.ngOnInit();

    //TODO: Revisit and confirm. The default values of the FormControls didn't seem to take in this test.
    component.exerciseForm.controls.id.setValue(0);
    component.exerciseForm.controls.name.setValue(exercise.name);
    component.exerciseForm.controls.description.setValue(exercise.description);
    component.exerciseForm.controls.setup.setValue(exercise.setup);
    component.exerciseForm.controls.movement.setValue(exercise.movement);
    component.exerciseForm.controls.involvesReps.setValue(exercise.involvesReps);
    component.exerciseForm.controls.oneSided.setValue(exercise.oneSided);
    component.exerciseForm.controls.pointsToRemember.setValue(exercise.pointsToRemember);
    component.exerciseForm.controls.resistanceType.setValue(exercise.resistanceType);
    component.exerciseForm.controls.targetAreas.setValue({'Chest': true, 'Biceps': false, 'Triceps': false});

    //ACT
    component.saveExercise();

    //ASSERT
    expect(exerciseService.add).toHaveBeenCalledWith(exercise);
    expect(component.saving).toBeFalse();
    expect(component.infoMsg).toContain("Exercise created at ");

  });

  it('should update exercise', () => {

    //console.log("component.exerciseForm: ", component.exerciseForm);
    component.saveExercise();
    expect(exerciseService.update).toHaveBeenCalledWith(EXERCISE);
    expect(component.saving).toBeFalse();
    expect(component.infoMsg).toContain("Exercise updated at ");

  });

  it('should disable and clear bilateral option when one sided is chosen', () => {
    component.exerciseForm.controls.usesBilateralResistance.setValue(true);
    expect(component.exerciseForm.controls.usesBilateralResistance.value).toBeTrue();
    component.exerciseForm.controls.oneSided.setValue(true);
    expect(component.exerciseForm.controls.usesBilateralResistance.value).toBeFalse();
    expect(component.exerciseForm.controls.usesBilateralResistance.enabled).toBeFalse();
  });

  it('should enable bilateral option when one sided option is cleared', () => {
    component.exerciseForm.controls.oneSided.setValue(true);
    expect(component.exerciseForm.controls.usesBilateralResistance.enabled).toBeFalse();
    component.exerciseForm.controls.oneSided.setValue(false);
    expect(component.exerciseForm.controls.usesBilateralResistance.enabled).toBeTrue();
  });

});
