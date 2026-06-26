import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, Pipe, PipeTransform, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, Router, RouterModule, UrlSegment } from '@angular/router';

import { of } from 'rxjs';

import { ExerciseEditComponent } from './exercise-edit.component';
import { ExerciseService } from '../_services/exercise.service';
import { Exercise, ExerciseTargetAreaLink, TargetArea } from '../../api/';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzTooltipModule } from 'ng-zorro-antd/tooltip';
import { type Mocked } from 'vitest';

//TODO: Move initialization inside beforeEach()
const EXERCISE: Exercise = <Exercise>{
  id: 2,
  publicId: 'some-guid',
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

@Pipe({
  name: 'insertSpaceBeforeCapital',
  standalone: true
})
class InsertSpaceBeforeCapitalPipeMock implements PipeTransform {
  transform(): string {
    return "I'm just a mock!";
  }
}

function getActivatedRouteSnapshot(): ActivatedRouteSnapshot {
  const activatedRouteSnapshot = new ActivatedRouteSnapshot();
  activatedRouteSnapshot.url = [];
  activatedRouteSnapshot.url.push(new UrlSegment('edit', {}));
  activatedRouteSnapshot.params = { 'id': 'some-guid' };
  return activatedRouteSnapshot;
}


describe('ExerciseEditComponent', () => {
  let component: ExerciseEditComponent;
  let fixture: ComponentFixture<ExerciseEditComponent>;
  let exerciseService: ExerciseService;

  beforeEach(async () => {
    const resistanceTypes = new Map<number, string>();
    resistanceTypes.set(0, 'Free Weight');
    resistanceTypes.set(1, 'Resistance Band');

    const ExerciseServiceMock: Partial<Mocked<ExerciseService>> = {
      getTargetAreas: vi.fn<ExerciseService['getTargetAreas']>().mockImplementation(() => {
        const targetAreas = new Array<TargetArea>();
        targetAreas.push(<TargetArea>{ id: 1, name: "Chest", sequence: 1, createdDateTime: new Date(), modifiedDateTime: null, createdByUserId: 0, isDeleted: false });
        targetAreas.push(<TargetArea>{ id: 2, name: "Biceps", sequence: 1, createdDateTime: new Date(), modifiedDateTime: null, createdByUserId: 0, isDeleted: false });
        targetAreas.push(<TargetArea>{ id: 3, name: "Triceps", sequence: 1, createdDateTime: new Date(), modifiedDateTime: null, createdByUserId: 0, isDeleted: false });
        return of(targetAreas);
      }),
      getById: vi.fn<ExerciseService['getById']>().mockReturnValue(of(EXERCISE)),
      getResistanceTypes: vi.fn<ExerciseService['getResistanceTypes']>().mockReturnValue(of(resistanceTypes)),
      add: vi.fn<ExerciseService['add']>().mockImplementation((exercise: Exercise) => of(exercise)),
      update: vi.fn<ExerciseService['update']>().mockImplementation((exercise: Exercise) => of(exercise))
    };

    TestBed.configureTestingModule({
      imports: [
        RouterModule.forRoot([]),
        ExerciseEditComponent,
        InsertSpaceBeforeCapitalPipeMock
      ],
      providers: [
        {
          provide: ExerciseService,
          useValue: ExerciseServiceMock
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({
              id: 'some-guid',
            }),
            snapshot: getActivatedRouteSnapshot()
          }
        },
        provideZonelessChangeDetection()
      ]
    })
      .overrideComponent(ExerciseEditComponent, {
        remove: { imports: [NzSpinModule, NzTooltipModule] }, //NzSwitchModule needs to remain as we use ngModel with it
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseEditComponent);
    component = fixture.componentInstance;
    exerciseService = TestBed.inject(ExerciseService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize signals with default values', () => {
    expect(component.loading()).toBe(false); // Will be false after ngOnInit completes
    expect(component.infoMsg()).toBeNull();
    expect(component.saving()).toBe(false);
    expect(component.errorMsg()).toBeNull();
  });

  it('should build the form', () => {
    expect(component.exerciseForm).toBeTruthy();
    expect(component.exerciseForm.name).toBeTruthy();
    expect(component.exerciseForm.description).toBeTruthy();
    expect(component.exerciseForm.resistanceType).toBeTruthy();
    expect(component.exerciseForm.oneSided).toBeTruthy();
    expect(component.exerciseForm.targetAreas).toBeTruthy();
    expect(component.exerciseForm.setup).toBeTruthy();
    expect(component.exerciseForm.movement).toBeTruthy();
    expect(component.exerciseForm.pointsToRemember).toBeTruthy();
  });

  it('should require a name', () => {
    component.exerciseForm.name().value.set('');
    expect(component.exerciseForm.name().errors().some(e => e.kind === 'required')).toBe(true);
  });

  it('should require at least one target area', () => {
    //Loaded exercise has Chest selected; clearing all should produce the requireOne error
    component.exerciseForm.targetAreas().value.set(
      component.exerciseForm.targetAreas().value().map(a => ({ ...a, selected: false }))
    );
    expect(component.exerciseForm.targetAreas().errors().some(e => e.kind === 'requireOne')).toBe(true);
  });

  it('should have default values for form if no exercise loaded', () => {
    //ARRANGE
    const activatedRoute = TestBed.inject(ActivatedRoute);
    activatedRoute.snapshot.params = { id: 0 };

    //ACT
    component.ngOnInit(); //Because we changed ActivatedRoute

    //ASSERT
    expect(component.exerciseForm.id().value()).toEqual(0);
  });

  it('should get all target areas', () => {
    expect(component.allTargetAreas).toBeTruthy();
    expect(exerciseService.getTargetAreas).toHaveBeenCalledTimes(1);
  });

  it('should load exercise into the model when editing', () => {
    //Our default route mock includes a value for exercise ID
    expect(exerciseService.getById).toHaveBeenCalledWith('some-guid');
    expect(component.exerciseForm.id().value()).toEqual(EXERCISE.id);
    expect(component.exerciseForm.name().value()).toEqual(EXERCISE.name);
    expect(component.exerciseForm.description().value()).toEqual(EXERCISE.description);
    expect(component.exerciseForm.setup().value()).toEqual(EXERCISE.setup);
    expect(component.exerciseForm.movement().value()).toEqual(EXERCISE.movement);
    expect(component.exerciseForm.pointsToRemember().value()).toEqual(EXERCISE.pointsToRemember);
  });

  it('should mark the loaded target area as selected', () => {
    const chest = component.exerciseForm.targetAreas().value().find(a => a.name === 'Chest');
    const biceps = component.exerciseForm.targetAreas().value().find(a => a.name === 'Biceps');
    expect(chest?.selected).toBe(true);   //EXERCISE links targetAreaId 1 (Chest)
    expect(biceps?.selected).toBe(false);
  });

  it('should get resistance types', () => {
    expect(component.resistanceTypes).toBeTruthy();
    expect(exerciseService.getResistanceTypes).toHaveBeenCalledTimes(1);
  });

  it('should return exercise ID via exerciseId property', () => {
    expect(component.exerciseId).toBe(EXERCISE.id);
  });

  it('should add exercise', async () => {
    //ARRANGE - create a fresh component already in the "new exercise" state
    const route = TestBed.inject(ActivatedRoute);
    route.snapshot.params['id'] = 0;
    const router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(ExerciseEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); //ngOnInit runs the "new" path

    component.exerciseForm.name().value.set('Some New Exercise');
    component.exerciseForm.description().value.set('Ultra Mega Super Press');
    component.exerciseForm.setup().value.set('Focus!');
    component.exerciseForm.movement().value.set('Forward!');
    component.exerciseForm.pointsToRemember().value.set('Form!');
    component.exerciseForm.resistanceType().value.set('1');
    component.exerciseForm.involvesReps().value.set(true);
    component.exerciseForm.oneSided().value.set(false);
    component.exerciseForm.usesBilateralResistance().value.set(false);
    //Select the "Chest" target area (index 0) via the field, preserving array identity
    component.exerciseForm.targetAreas[0].selected().value.set(true);

    //ACT
    component.saveExercise();
    await fixture.whenStable(); //submit() runs its action asynchronously

    //ASSERT
    expect(exerciseService.add).toHaveBeenCalledTimes(1);
    const added = vi.mocked(exerciseService.add).mock.calls[0][0];
    expect(added.name).toEqual('Some New Exercise');
    expect(added.resistanceType).toEqual(1);                 //Converted from the string model value
    expect(added.exerciseTargetAreaLinks).toEqual([{ exerciseId: 0, targetAreaId: 1 }]);
    expect(component.saving()).toBe(false);
    expect(component.infoMsg()).toContain("Exercise created at ");
  });

  it('should update exercise', async () => {
    component.saveExercise();
    await fixture.whenStable(); //submit() runs its action asynchronously
    expect(exerciseService.update).toHaveBeenCalledTimes(1);
    const updated = vi.mocked(exerciseService.update).mock.calls[0][0];
    expect(updated.id).toEqual(EXERCISE.id);
    expect(updated.name).toEqual(EXERCISE.name);
    expect(component.saving()).toBe(false);
    expect(component.infoMsg()).toContain("Exercise updated at ");
  });

  it('should disable the bilateral option when one sided is chosen', () => {
    expect(component.exerciseForm.usesBilateralResistance().disabled()).toBe(false);
    component.exerciseForm.oneSided().value.set(true);
    expect(component.exerciseForm.usesBilateralResistance().disabled()).toBe(true);
  });

  it('should not persist bilateral resistance when one sided', () => {
    component.exerciseForm.usesBilateralResistance().value.set(true);
    component.exerciseForm.oneSided().value.set(true);

    component.saveExercise();

    const updated = vi.mocked(exerciseService.update).mock.calls[0][0];
    expect(updated.usesBilateralResistance).toBe(false);
  });

});
