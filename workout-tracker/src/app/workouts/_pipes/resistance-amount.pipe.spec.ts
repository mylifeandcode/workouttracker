import { ConfigService } from '../../core/_services/config/config.service';
import { ResistanceAmountPipe } from './resistance-amount.pipe';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { type Mocked } from 'vitest';

describe('ResistanceAmountPipe', () => {
    let pipe: ResistanceAmountPipe;

    const configServiceMock: Mocked<Pick<ConfigService, 'get'>> = {
        get: vi.fn<ConfigService['get']>(() => 'lb').mockName('get')
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                ResistanceAmountPipe,
                {
                    provide: ConfigService,
                    useValue: configServiceMock
                },
                provideZonelessChangeDetection()
            ]
        });

        pipe = TestBed.inject(ResistanceAmountPipe);
    });

    afterEach(() => {
        vi.resetAllMocks();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

});
