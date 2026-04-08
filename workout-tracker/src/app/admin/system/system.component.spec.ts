import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundService } from '../../core/_services/sound/sound.service';

import { SystemComponent } from './system.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { provideZonelessChangeDetection } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { type Mocked } from 'vitest';

describe('SystemComponent', () => {
  let component: SystemComponent;
  let fixture: ComponentFixture<SystemComponent>;

  beforeEach(async () => {
    const SoundServiceMock: Partial<Mocked<SoundService>> = {
      playSound: vi.fn()
    };
    const MessageServiceMock: Partial<Mocked<NzMessageService>> = {
      success: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        SystemComponent
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: SoundService,
          useValue: SoundServiceMock
        },
        {
          provide: NzMessageService,
          useValue: MessageServiceMock
        }
      ]
    })
      .overrideComponent(//Special thanks to these guys FTW: https://www.angulararchitects.io/en/blog/testing-angular-standalone-components/
        SystemComponent, {
        remove: {
          imports: [NzSpinModule] // Remove the original imports
        },
        add: { schemas: [CUSTOM_ELEMENTS_SCHEMA] }
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

  it('should test the toast', () => {
    const messageService = TestBed.inject(NzMessageService);
    component.testToast();
    expect(messageService.success).toHaveBeenCalled();
  });
});
