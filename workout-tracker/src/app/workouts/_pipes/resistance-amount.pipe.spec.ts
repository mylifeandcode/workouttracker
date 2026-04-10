import { ConfigService } from '../../core/_services/config/config.service';
import { ResistanceAmountPipe } from './resistance-amount.pipe';
import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { type Mocked } from 'vitest';

describe('ResistanceAmountPipe', () => {
    let pipe: ResistanceAmountPipe;

    beforeEach(() => {
        const MockConfigService: Partial<Mocked<ConfigService>> = {
            get: vi.fn().mockReturnValue('lb')
        };

        TestBed.configureTestingModule({
            providers: [
                ResistanceAmountPipe,
                {
                    provide: ConfigService,
                    useValue: MockConfigService
                },
                provideZonelessChangeDetection()
            ]
        });

        pipe = TestBed.inject(ResistanceAmountPipe);
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

});
