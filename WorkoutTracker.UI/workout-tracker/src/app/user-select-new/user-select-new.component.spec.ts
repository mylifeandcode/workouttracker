import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserSelectNewComponent } from './user-select-new.component';

describe('UserSelectNewComponent', () => {
  let component: UserSelectNewComponent;
  let fixture: ComponentFixture<UserSelectNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserSelectNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserSelectNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
