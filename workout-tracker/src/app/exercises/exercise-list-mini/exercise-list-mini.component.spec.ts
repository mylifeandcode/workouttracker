import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExerciseListMiniComponent } from './exercise-list-mini.component';
import { ExerciseService } from '../_services/exercise.service';
import { TargetAreaService } from '../_services/target-area.service';
import { of } from 'rxjs';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { ExerciseDTO, PaginatedResultsOfExerciseDTO, TargetAreaDTO } from '../../api';
import { type Mocked } from 'vitest';

describe('ExerciseListMiniComponent', () => {
  let component: ExerciseListMiniComponent;
  let fixture: ComponentFixture<ExerciseListMiniComponent>;

  const exerciseServiceMock: Mocked<Pick<ExerciseService, 'getAll'>> = {
    getAll: vi.fn<ExerciseService['getAll']>(() => of(<PaginatedResultsOfExerciseDTO>{})).mockName('getAll')
  };

  const targetAreaServiceMock: Mocked<Pick<TargetAreaService, 'getAll'>> = {
    getAll: vi.fn<TargetAreaService['getAll']>(() => of(new Array<TargetAreaDTO>())).mockName('getAll')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        {
          provide: ExerciseService,
          useValue: exerciseServiceMock
        },
        {
          provide: TargetAreaService,
          useValue: targetAreaServiceMock
        },
        provideZonelessChangeDetection()
      ],
      imports: [
        ExerciseListMiniComponent
      ]
    })
      .overrideComponent(ExerciseListMiniComponent, {
        remove: {
          imports: [NzTableModule] //Some imports still required to test
        },
        add: {
          schemas: [CUSTOM_ELEMENTS_SCHEMA]
        }
      })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExerciseListMiniComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.resetAllMocks();
    vi.restoreAllMocks(); //Undoes the exerciseSelected.emit spy
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  //TODO: Revisit
  it.skip('should get exercises lazily', () => {
    //TODO: Consolidate the method we're testing: it exists in 2 different classes.

    //ARRANGE
    const lazyLoadEvent: Partial<NzTableQueryParams> = {
      "pageIndex": 1,
      "pageSize": 10
    };

    //ACT
    component.getExercisesLazy(lazyLoadEvent as NzTableQueryParams);

    //ASSERT
    expect(exerciseServiceMock.getAll).toHaveBeenCalledWith(0, 10, 'Pre', ['Chest']);
  });

  it('should emit event when exercise is selected', () => {
    //ARRANGE
    const exerciseDTO = <ExerciseDTO>{};
    vi.spyOn(component.exerciseSelected, 'emit');

    //ACT
    component.selectExercise(exerciseDTO);

    //ASSERT
    expect(component.exerciseSelected.emit).toHaveBeenCalledWith(exerciseDTO);
  });

});
