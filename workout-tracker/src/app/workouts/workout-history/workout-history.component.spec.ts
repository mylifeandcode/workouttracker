import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WorkoutHistoryComponent } from './workout-history.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('WorkoutHistoryComponent', () => {
  let component: WorkoutHistoryComponent;
  let fixture: ComponentFixture<WorkoutHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        WorkoutHistoryComponent
      ],
      imports: [
        HttpClientTestingModule
      ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkoutHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
