import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SoundService } from 'app/core/_services/sound/sound.service';

import { SystemComponent } from './system.component';
import { NzMessageService } from 'ng-zorro-antd/message';
import { provideZonelessChangeDetection } from '@angular/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NzSpinModule } from 'ng-zorro-antd/spin';


class MockSoundService {
    playSound = vi.fn();
}

class MockMessageService {
    success = vi.fn();
}

describe('SystemComponent', () => {
    let component: SystemComponent;
    let fixture: ComponentFixture<SystemComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                SystemComponent
            ],
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: SoundService,
                    useClass: MockSoundService
                },
                {
                    provide: NzMessageService,
                    useClass: MockMessageService
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
