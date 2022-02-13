import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { WorkoutHistoryComponent } from './workout-history.component';
import { TableComponentMock } from 'app/testing/component-mocks/primeNg/p-table-mock';

describe('WorkoutHistoryComponent', () => {
  let component: WorkoutHistoryComponent;
  let fixture: ComponentFixture<WorkoutHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ 
        WorkoutHistoryComponent, 
        TableComponentMock
      ],
      imports: [
        HttpClientTestingModule
      ]
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
