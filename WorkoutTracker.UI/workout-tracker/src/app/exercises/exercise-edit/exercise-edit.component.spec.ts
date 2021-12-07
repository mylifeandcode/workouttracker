import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Pipe, PipeTransform } from '@angular/core';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { of } from 'rxjs';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

import { ExerciseEditComponent } from './exercise-edit.component';
import { ExerciseService } from '../exercise.service';
import { TargetArea } from 'app/workouts/models/target-area';
import { Exercise } from 'app/workouts/models/exercise';
import { ActivatedRoute } from '@angular/router';
import { By } from '@angular/platform-browser';

const USER_ID: number = 5;
const EXERCISE: Exercise = <Exercise> {
  id: 2, 
  name: 'Some Exercise', 
  description: 'This is a nice exercise. Blah, blah, blah.', 
  setup: 'Get ready', 
  movement: 'Whatever', 
  pointsToRemember: 'Be careful'
}

class ExerciseServiceMock {
  resistanceTypes: Map<number, string> = new Map<number, string>();

  constructor() {
    this.resistanceTypes.set(0, 'Free Weight');
    this.resistanceTypes.set(1, 'Resistance Band');
  }

  getTargetAreas = jasmine.createSpy('getTargetAreas').and.returnValue(of(new Array<TargetArea>()));
  getById = jasmine.createSpy('getById').and.returnValue(of(EXERCISE));
  getResistanceTypes =
    jasmine.createSpy('getResistanceTypes')
      .and.returnValue(of(this.resistanceTypes));
}

@Pipe({
  name: 'insertSpaceBeforeCapital'
})
class InsertSpaceBeforeCapitalPipeMock implements PipeTransform {
  transform(value: string) { return "I'm just a mock!"; }
}

describe('ExerciseEditComponent', () => {
  let component: ExerciseEditComponent;
  let fixture: ComponentFixture<ExerciseEditComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        ExerciseEditComponent, 
        InsertSpaceBeforeCapitalPipeMock
      ],
      imports: [
        ProgressSpinnerModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TableModule
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
             })
            }
         }
       ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseEditComponent);
    component = fixture.componentInstance;
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
    
    expect(component.exerciseForm.controls.resistanceTypes).toBeTruthy();
    expect(component.exerciseForm.controls.oneSided).toBeTruthy();
    expect(component.exerciseForm.controls.targetAreas).toBeTruthy();
    expect(component.exerciseForm.controls.setup).toBeTruthy();
    expect(component.exerciseForm.controls.movement).toBeTruthy();
    expect(component.exerciseForm.controls.pointsToRemember).toBeTruthy();
  });

  it('should have default values for form if no exercise loaded', () => {
    //ARRANGE
    let activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.params = of({id: 0});

    //ACT
    component.ngOnInit(); //Because we changed ActivatedRoute

    //ASSERT
    expect(component.exerciseForm.controls.id.value).toEqual(0);
    
  });

  it('should get all target areas', () => {
    const exerciseService = TestBed.inject(ExerciseService);
    expect(component.allTargetAreas).toBeTruthy();
    expect(exerciseService.getTargetAreas).toHaveBeenCalledTimes(1);
  });

  it('should load exercise when editing', () => {
    //Our default route mock includes a value for exercise ID
    const exerciseService = TestBed.inject(ExerciseService);
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
    const exerciseService = TestBed.inject(ExerciseService);
    expect(component.resistanceTypes).toBeTruthy();
    expect(exerciseService.getResistanceTypes).toHaveBeenCalledTimes(1);
  });

  //TODO: Complete
  xit('should save exercise', waitForAsync(() => {

    const exerciseService = TestBed.inject(ExerciseService);
    fixture.whenStable().then(() => {

      component.exerciseForm.setValue({
        id: 10,
        name: 'Standing Press w/Resistance Bands',
        description: 'something',
        resistanceTypes: '[1]',
        oneSided: [false],
        targetAreas: ['Chest', 'Triceps'],
        setup: 'Ready',
        movement: 'Set',
        pointsToRemember: 'Go'
      });

      const button = fixture.debugElement.query(By.css("button[type = 'submit']"));

    });

  }));

});
