import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ResistanceBandService } from 'app/admin/resistance-bands/resistance-band.service';
import { ResistanceBandIndividual } from 'app/shared/models/resistance-band-individual';
import { of } from 'rxjs';
import { WorkoutPlan } from '../models/workout-plan';
import { WorkoutService } from '../workout.service';

import { WorkoutPlanComponent } from './workout-plan.component';

class WorkoutServiceMock {
  getPlan = jasmine.createSpy('getPlan').and.returnValue(of(new WorkoutPlan()));
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

describe('WorkoutPlanComponent', () => {
  let component: WorkoutPlanComponent;
  let fixture: ComponentFixture<WorkoutPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkoutPlanComponent ], 
      providers: [
        {
          provide: WorkoutService, 
          useClass: WorkoutServiceMock
        }, 
        {
          provide: ResistanceBandService, 
          useClass: ResistanceBandServiceMock
        }, 
        FormBuilder //TODO: Determine if this is kosher or if there's a preferred mocking approach
      ],
      imports: [
        RouterTestingModule
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
});
