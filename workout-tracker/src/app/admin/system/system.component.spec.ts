import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundService } from 'app/core/services/sound.service';

import { SystemComponent } from './system.component';

class SoundServiceMock {
  playSound = jasmine.createSpy('playSound');
}

describe('SystemComponent', () => {
  let component: SystemComponent;
  let fixture: ComponentFixture<SystemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SystemComponent ],
      providers: [
        {
          provide: SoundService,
          useClass: SoundServiceMock
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should test the SoundService', () => {
    const soundService = TestBed.inject(SoundService);
    component.testSoundService();
    expect(soundService.playSound).toHaveBeenCalled();
  });
});
