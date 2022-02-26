import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
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

  it('should submit plan', () => {});

  it('should submit plan for later', () => {});
});
